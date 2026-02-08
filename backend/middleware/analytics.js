const { ApiAnalytics } = require('../models/Analytics');
const axios = require('axios');

// Track API requests
const trackApiRequest = async (req, res, next) => {
    const startTime = Date.now();

    // Generate session ID from IP + User Agent (simple fingerprint)
    const sessionId = require('crypto')
        .createHash('md5')
        .update(req.ip + req.get('user-agent'))
        .digest('hex');

    // Capture response
    const originalSend = res.send;
    let responseBody;

    res.send = function (data) {
        responseBody = data;
        originalSend.call(this, data);
    };

    // When response finishes
    res.on('finish', async () => {
        try {
            const responseTime = Date.now() - startTime;

            // Extract requested city and date from query/body
            const requestedCity = req.query.city || req.body.city;
            const requestedDate = req.query.date || req.body.date;

            // Try to get user location from IP
            let userLocation = {};
            try {
                const ipInfo = await axios.get(`http://ip-api.com/json/${req.ip}?fields=status,country,city,regionName,timezone,lat,lon`);
                if (ipInfo.data.status === 'success') {
                    userLocation = {
                        country: ipInfo.data.country,
                        city: ipInfo.data.city,
                        region: ipInfo.data.regionName,
                        timezone: ipInfo.data.timezone,
                        coordinates: {
                            lat: ipInfo.data.lat,
                            lng: ipInfo.data.lon
                        }
                    };
                }
            } catch (ipError) {
                // Silently fail - analytics shouldn't break app
            }

            // Determine engine used from response
            let engineUsed = 'unknown';
            if (responseBody) {
                try {
                    const parsedBody = typeof responseBody === 'string' ? JSON.parse(responseBody) : responseBody;
                    if (parsedBody._useNative !== undefined) {
                        engineUsed = parsedBody._useNative ? 'native' : 'js';
                    }
                } catch (e) {
                    // Response not JSON or doesn't have engine info
                }
            }

            // Create analytics record
            await ApiAnalytics.create({
                endpoint: req.path,
                method: req.method,
                sessionId,
                ipAddress: req.ip,
                userLocation,
                requestedCity,
                requestedDate: requestedDate ? new Date(requestedDate) : undefined,
                engineUsed,
                responseTime,
                statusCode: res.statusCode,
                success: res.statusCode >= 200 && res.statusCode < 400,
                errorMessage: res.statusCode >= 400 ? responseBody : undefined,
                userAgent: req.get('user-agent'),
                referer: req.get('referer')
            });

        } catch (error) {
            // Log but don't break the app
            console.error('Analytics tracking error:', error.message);
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
