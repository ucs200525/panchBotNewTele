const { ApiAnalytics } = require('../models/Analytics');

// ── IP Geolocation Cache ────────────────────────────────────────────
// Cache IP → location in memory to avoid hammering the free API.
// TTL: entries expire after 24 hours.
const ipCache = new Map();
const IP_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Resolve IP to location using Vercel headers (free, no API call)
 * or fallback to ip-api.com (free, 45 req/min limit).
 */
async function resolveIPLocation(req) {
    // 1. Try Vercel-injected headers (instant, free, production only)
    const vercelCountry = req.headers['x-vercel-ip-country'];
    const vercelCity = req.headers['x-vercel-ip-city'];
    const vercelRegion = req.headers['x-vercel-ip-country-region'];
    const vercelLat = req.headers['x-vercel-ip-latitude'];
    const vercelLng = req.headers['x-vercel-ip-longitude'];

    if (vercelCountry) {
        return {
            country: vercelCountry,
            countryCode: vercelCountry,
            city: vercelCity ? decodeURIComponent(vercelCity) : null,
            region: vercelRegion || null,
            timezone: null,
            isp: null,
            coordinates: {
                lat: vercelLat ? parseFloat(vercelLat) : null,
                lng: vercelLng ? parseFloat(vercelLng) : null,
            }
        };
    }

    // 2. Extract IP
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
    if (!ip || ip === '::1' || ip === '127.0.0.1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
        return { country: 'Localhost', city: 'Local', region: null, countryCode: 'LC', timezone: null, isp: null, coordinates: { lat: null, lng: null } };
    }

    // 3. Check cache
    const cached = ipCache.get(ip);
    if (cached && (Date.now() - cached.timestamp < IP_CACHE_TTL)) {
        return cached.data;
    }

    // 4. Fallback: ip-api.com (free, no key needed, 45 req/min)
    try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 3000); // 3s timeout

        const response = await fetch(`http://ip-api.com/json/${ip}?fields=status,country,countryCode,regionName,city,timezone,isp,lat,lon`, {
            signal: controller.signal
        });
        clearTimeout(timeout);

        const data = await response.json();

        if (data.status === 'success') {
            const location = {
                country: data.country,
                countryCode: data.countryCode,
                city: data.city,
                region: data.regionName,
                timezone: data.timezone,
                isp: data.isp,
                coordinates: {
                    lat: data.lat,
                    lng: data.lon,
                }
            };

            // Cache it
            ipCache.set(ip, { data: location, timestamp: Date.now() });

            // Evict old cache entries periodically
            if (ipCache.size > 5000) {
                const now = Date.now();
                for (const [key, val] of ipCache) {
                    if (now - val.timestamp > IP_CACHE_TTL) ipCache.delete(key);
                }
            }

            return location;
        }
    } catch (err) {
        // Silently fail - geolocation is best-effort
        console.debug('IP geolocation lookup failed (non-blocking):', err.message);
    }

    return null;
}

// ── Analytics Tracking Middleware ────────────────────────────────────
const trackApiRequest = async (req, res, next) => {
    const startTime = Date.now();

    // Capture the finish event to log after response is sent
    res.on('finish', async () => {
        try {
            const responseTime = Date.now() - startTime;
            const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
            const userId = req.headers['x-user-id'] || null;

            // Resolve location (async, non-blocking best-effort)
            let userLocation = null;
            try {
                userLocation = await resolveIPLocation(req);
            } catch (e) {
                // ignore
            }

            const analyticsData = {
                endpoint: req.baseUrl + req.path,
                method: req.method,
                userId: userId,
                sessionId: userId || 'unknown', // Backward compat
                ipAddress: ip,
                userAgent: req.headers['user-agent'],
                responseTime: responseTime,
                statusCode: res.statusCode,
                success: res.statusCode < 400,
                requestedCity: req.query.city || req.body?.city || null,
                requestedDate: req.query.date || req.body?.date || null,
                engineUsed: req.query.engine || 'unknown',
                userLocation: userLocation,
                referer: req.headers.referer || req.headers.referrer || null,
            };

            // Save to DB asynchronously - don't block the response
            ApiAnalytics.create(analyticsData).catch(err => {
                console.error('Analytics Save Error:', err.message);
            });
        } catch (error) {
            console.error('Analytics Middleware Error:', error.message);
        }
    });

    next();
};

// Exclude certain endpoints from tracking
const excludeFromTracking = (excludePaths = []) => {
    return (req, res, next) => {
        const shouldExclude = excludePaths.some(path => req.path.startsWith(path));
        if (shouldExclude) {
            return next();
        }
        trackApiRequest(req, res, next);
    };
};

module.exports = {
    trackApiRequest,
    excludeFromTracking
};
