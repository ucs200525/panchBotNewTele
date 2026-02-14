const { ApiAnalytics } = require('../models/Analytics');

// Track API requests - Re-enabled for DIRECT and FAST tracking
const trackApiRequest = async (req, res, next) => {
    const startTime = Date.now();
    
    // Capture the finish event to log after response is sent
    res.on('finish', async () => {
        try {
            const responseTime = Date.now() - startTime;
            
            // Basic request info
            const analyticsData = {
                endpoint: req.baseUrl + req.path,
                method: req.method,
                ipAddress: req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress,
                userAgent: req.headers['user-agent'],
                responseTime: responseTime,
                statusCode: res.statusCode,
                success: res.statusCode < 400,
                sessionId: req.headers['x-session-id'] || 'unknown', // If your frontend sends this
                requestedCity: req.query.city || req.body.city || null,
                engineUsed: req.query.engine || 'unknown'
            };

            // Save to DB asynchronously - don't await so we don't block anything
            ApiAnalytics.create(analyticsData).catch(err => {
                // Use console.log for internal errors to avoid recursion
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
