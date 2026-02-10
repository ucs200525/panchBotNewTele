const { ApiAnalytics } = require('../models/Analytics');
const axios = require('axios');

// Track API requests - DISABLED
const trackApiRequest = async (req, res, next) => {
    // Analytics tracking disabled as requested to avoid MongoDB connection issues
    return next();
    
    /*
    const startTime = Date.now();
    ... rest of the code ...
    */
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
