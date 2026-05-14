const express = require('express');
const router = express.Router();
const { ApiAnalytics, PageView, DailySummary } = require('../models/Analytics');
const Log = require('../models/Log');

// ── Max time for aggregation queries (prevents MongoDB timeout) ─────
const MAX_QUERY_MS = 8000;

// ── Admin Authentication Middleware ─────────────────────────────────
const authenticateAdmin = (req, res, next) => {
    const secret = req.headers['x-admin-secret'];
    const envSecret = process.env.ADMIN_SECRET;
    const effectiveSecret = envSecret || 'admin123';

    if (secret && secret === effectiveSecret) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized: Invalid Admin Secret' });
    }
};

// ── PUBLIC: Page View Tracking (no auth needed) ─────────────────────
router.post('/pageview', async (req, res) => {
    try {
        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.socket.remoteAddress;
        const userId = req.headers['x-user-id'] || req.body.userId || 'unknown';

        // Resolve location from Vercel headers (free, instant)
        let userLocation = null;
        const vercelCountry = req.headers['x-vercel-ip-country'];
        if (vercelCountry) {
            const vercelCity = req.headers['x-vercel-ip-city'];
            userLocation = {
                country: vercelCountry,
                countryCode: vercelCountry,
                city: vercelCity ? decodeURIComponent(vercelCity) : null,
                region: req.headers['x-vercel-ip-country-region'] || null,
            };
        }

        const pageView = {
            userId: userId,
            page: req.body.page || '/',
            ipAddress: ip,
            userLocation: userLocation,
            screenWidth: req.body.screenWidth || null,
            screenHeight: req.body.screenHeight || null,
            referrer: req.body.referrer || req.headers.referer || null,
            userAgent: req.body.userAgent || req.headers['user-agent'],
            timestamp: req.body.timestamp ? new Date(req.body.timestamp) : new Date(),
        };

        // Fire and forget
        PageView.create(pageView).catch(err => {
            console.error('PageView Save Error:', err.message);
        });

        res.json({ ok: true });
    } catch (error) {
        res.json({ ok: true }); // Never fail on analytics
    }
});

// ── Protect ALL remaining analytics routes with admin auth ──────────
router.use(authenticateAdmin);

// ═══════════════════════════════════════════════════════════════════════
// CLEANUP ROUTES
// ═══════════════════════════════════════════════════════════════════════

// DELETE: Clear old analytics data
router.delete('/cleanup/analytics', async (req, res) => {
    try {
        const { olderThanDays, keepCount } = req.query;
        let deletedCount = 0;

        if (olderThanDays) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThanDays));
            const result = await ApiAnalytics.deleteMany({ timestamp: { $lt: cutoffDate } });
            deletedCount = result.deletedCount;
            res.json({ success: true, message: `Deleted analytics older than ${olderThanDays} days`, deletedCount, cutoffDate });
        } else if (keepCount) {
            const totalCount = await ApiAnalytics.countDocuments();
            const keepN = parseInt(keepCount);
            if (totalCount > keepN) {
                const recordToKeep = await ApiAnalytics.findOne().sort({ timestamp: -1 }).skip(keepN - 1).select('timestamp');
                if (recordToKeep) {
                    const result = await ApiAnalytics.deleteMany({ timestamp: { $lt: recordToKeep.timestamp } });
                    deletedCount = result.deletedCount;
                }
            }
            res.json({ success: true, message: `Kept latest ${keepN} records`, deletedCount });
        } else {
            res.status(400).json({ error: 'Specify either olderThanDays or keepCount parameter' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Clear all analytics + pageviews
router.delete('/cleanup/analytics/all', async (req, res) => {
    try {
        const [analyticsResult, pageviewResult, summaryResult] = await Promise.all([
            ApiAnalytics.deleteMany({}),
            PageView.deleteMany({}),
            DailySummary.deleteMany({})
        ]);
        res.json({
            success: true,
            message: 'All analytics data deleted',
            analyticsDeleted: analyticsResult.deletedCount,
            pageviewsDeleted: pageviewResult.deletedCount,
            summariesDeleted: summaryResult.deletedCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Selective cleanup
router.delete('/cleanup/analytics/selective', async (req, res) => {
    try {
        const { type } = req.query;
        let filter = {};
        let description = '';

        switch (type) {
            case 'admin':
                filter = { $or: [{ endpoint: { $regex: '^/admin' } }, { endpoint: { $regex: '^/api/analytics' } }, { endpoint: '/analytics-dashboard.html' }] };
                description = 'admin and analytics requests';
                break;
            case 'favicon':
                filter = { endpoint: '/favicon.ico' };
                description = 'favicon requests';
                break;
            case 'errors':
                filter = { success: false };
                description = 'failed/error requests';
                break;
            case 'static':
                filter = { $or: [{ endpoint: { $regex: '\\.(css|js|png|jpg|ico|svg)$' } }, { endpoint: '/favicon.ico' }] };
                description = 'static file requests';
                break;
            default:
                return res.status(400).json({ error: 'Invalid type', validTypes: ['admin', 'favicon', 'errors', 'static'] });
        }

        const result = await ApiAnalytics.deleteMany(filter);
        res.json({ success: true, message: `Deleted ${result.deletedCount} ${description}`, deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Clear old logs
router.delete('/cleanup/logs', async (req, res) => {
    try {
        const { olderThanDays, keepCount } = req.query;
        let deletedCount = 0;

        if (olderThanDays) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThanDays));
            const result = await Log.deleteMany({ timestamp: { $lt: cutoffDate } });
            deletedCount = result.deletedCount;
            res.json({ success: true, message: `Deleted logs older than ${olderThanDays} days`, deletedCount });
        } else if (keepCount) {
            const totalCount = await Log.countDocuments();
            const keepN = parseInt(keepCount);
            if (totalCount > keepN) {
                const recordToKeep = await Log.findOne().sort({ timestamp: -1 }).skip(keepN - 1).select('timestamp');
                if (recordToKeep) {
                    const result = await Log.deleteMany({ timestamp: { $lt: recordToKeep.timestamp } });
                    deletedCount = result.deletedCount;
                }
            }
            res.json({ success: true, message: `Kept latest ${keepN} logs`, deletedCount });
        } else {
            res.status(400).json({ error: 'Specify either olderThanDays or keepCount parameter' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Clear all logs
router.delete('/cleanup/logs/all', async (req, res) => {
    try {
        const result = await Log.deleteMany({});
        res.json({ success: true, message: 'All logs deleted', deletedCount: result.deletedCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════
// STATS ROUTES (all with maxTimeMS to prevent timeout)
// ═══════════════════════════════════════════════════════════════════════

// GET: Space usage stats
router.get('/stats/space', async (req, res) => {
    try {
        const [analyticsCount, pageviewCount, logsCount] = await Promise.all([
            ApiAnalytics.countDocuments().maxTimeMS(MAX_QUERY_MS),
            PageView.countDocuments().maxTimeMS(MAX_QUERY_MS),
            Log.countDocuments().maxTimeMS(MAX_QUERY_MS)
        ]);

        const avgAnalyticsSize = 600;
        const avgPageviewSize = 300;
        const avgLogSize = 300;

        const analyticsSize = analyticsCount * avgAnalyticsSize;
        const pageviewSize = pageviewCount * avgPageviewSize;
        const logsSize = logsCount * avgLogSize;
        const totalSize = analyticsSize + pageviewSize + logsSize;

        res.json({
            analytics: { count: analyticsCount, estimatedSize: `${(analyticsSize / 1024 / 1024).toFixed(2)} MB` },
            pageviews: { count: pageviewCount, estimatedSize: `${(pageviewSize / 1024 / 1024).toFixed(2)} MB` },
            logs: { count: logsCount, estimatedSize: `${(logsSize / 1024 / 1024).toFixed(2)} MB` },
            total: { count: analyticsCount + pageviewCount + logsCount, estimatedSize: `${(totalSize / 1024 / 1024).toFixed(2)} MB` }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: Overall Statistics (FIXED - no more .distinct() timeout)
router.get('/stats/overall', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 7);

        const [
            totalRequests,
            todayRequests,
            last7DaysRequests,
            uniqueUsersResult,
            avgResponseResult,
            totalPageviews,
            todayPageviews
        ] = await Promise.all([
            ApiAnalytics.countDocuments().maxTimeMS(MAX_QUERY_MS),
            ApiAnalytics.countDocuments({ timestamp: { $gte: today } }).maxTimeMS(MAX_QUERY_MS),
            ApiAnalytics.countDocuments({ timestamp: { $gte: last7Days } }).maxTimeMS(MAX_QUERY_MS),
            // FIXED: Use $group instead of .distinct() to avoid timeout
            ApiAnalytics.aggregate([
                { $match: { userId: { $exists: true, $ne: null } } },
                { $group: { _id: '$userId' } },
                { $count: 'total' }
            ]).option({ maxTimeMS: MAX_QUERY_MS }),
            ApiAnalytics.aggregate([
                { $group: { _id: null, avg: { $avg: '$responseTime' } } }
            ]).option({ maxTimeMS: MAX_QUERY_MS }),
            PageView.countDocuments().maxTimeMS(MAX_QUERY_MS),
            PageView.countDocuments({ timestamp: { $gte: today } }).maxTimeMS(MAX_QUERY_MS),
        ]);

        const uniqueUsers = uniqueUsersResult[0]?.total || 0;
        const avgResponseTime = Math.round(avgResponseResult[0]?.avg || 0);

        res.json({
            totalRequests,
            todayRequests,
            last7DaysRequests,
            uniqueUsers,
            avgResponseTime,
            totalPageviews,
            todayPageviews,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: Most Popular Endpoints
router.get('/stats/popular-endpoints', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const timeRange = req.query.timeRange || 'all';

        let dateFilter = {};
        const now = new Date();
        if (timeRange === 'today') {
            const today = new Date(); today.setHours(0, 0, 0, 0);
            dateFilter = { timestamp: { $gte: today } };
        } else if (timeRange === 'week') {
            const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate() - 7);
            dateFilter = { timestamp: { $gte: weekAgo } };
        } else if (timeRange === 'month') {
            const monthAgo = new Date(); monthAgo.setDate(monthAgo.getDate() - 30);
            dateFilter = { timestamp: { $gte: monthAgo } };
        }

        const popularEndpoints = await ApiAnalytics.aggregate([
            { $match: dateFilter },
            { $group: { _id: '$endpoint', count: { $sum: 1 }, avgResponseTime: { $avg: '$responseTime' }, errorCount: { $sum: { $cond: ['$success', 0, 1] } } } },
            { $sort: { count: -1 } },
            { $limit: limit },
            { $project: { endpoint: '$_id', count: 1, avgResponseTime: { $round: ['$avgResponseTime', 0] }, errorRate: { $round: [{ $multiply: [{ $divide: ['$errorCount', '$count'] }, 100] }, 2] }, _id: 0 } }
        ]).option({ maxTimeMS: MAX_QUERY_MS });

        res.json(popularEndpoints);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: Most Requested Cities
router.get('/stats/popular-cities', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;

        const popularCities = await ApiAnalytics.aggregate([
            { $match: { requestedCity: { $exists: true, $ne: null } } },
            { $group: { _id: '$requestedCity', count: { $sum: 1 }, uniqueUsers: { $addToSet: '$userId' } } },
            { $project: { city: '$_id', requestCount: '$count', uniqueUsers: { $size: '$uniqueUsers' }, _id: 0 } },
            { $sort: { requestCount: -1 } },
            { $limit: limit }
        ]).option({ maxTimeMS: MAX_QUERY_MS });

        res.json(popularCities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: User Geography
router.get('/stats/user-geography', async (req, res) => {
    try {
        const byCountry = await ApiAnalytics.aggregate([
            { $match: { 'userLocation.country': { $exists: true, $ne: null } } },
            { $group: { _id: '$userLocation.country', count: { $sum: 1 }, cities: { $addToSet: '$userLocation.city' }, uniqueUsers: { $addToSet: '$userId' } } },
            { $project: { country: '$_id', requests: '$count', cityCount: { $size: '$cities' }, userCount: { $size: '$uniqueUsers' }, _id: 0 } },
            { $sort: { requests: -1 } },
            { $limit: 20 }
        ]).option({ maxTimeMS: MAX_QUERY_MS });

        res.json({ byCountry });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: Most Visited Frontend Pages
router.get('/stats/popular-pages', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        const pages = await PageView.aggregate([
            { $group: { _id: '$page', count: { $sum: 1 }, uniqueUsers: { $addToSet: '$userId' } } },
            { $project: { page: '$_id', views: '$count', uniqueUsers: { $size: '$uniqueUsers' }, _id: 0 } },
            { $sort: { views: -1 } },
            { $limit: limit }
        ]).option({ maxTimeMS: MAX_QUERY_MS });

        res.json(pages);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// ═══════════════════════════════════════════════════════════════════════
// ★ USER-GROUPED VIEW (NEW - the main feature)
// ═══════════════════════════════════════════════════════════════════════

// GET: All users with summary
router.get('/stats/users', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const users = await ApiAnalytics.aggregate([
            { $match: { userId: { $exists: true, $ne: null } } },
            {
                $group: {
                    _id: '$userId',
                    totalRequests: { $sum: 1 },
                    firstSeen: { $min: '$timestamp' },
                    lastSeen: { $max: '$timestamp' },
                    cities: { $addToSet: '$requestedCity' },
                    endpoints: { $addToSet: '$endpoint' },
                    ipAddresses: { $addToSet: '$ipAddress' },
                    lastLocation: { $last: '$userLocation' },
                    lastIP: { $last: '$ipAddress' },
                    avgResponseTime: { $avg: '$responseTime' },
                }
            },
            { $sort: { lastSeen: -1 } },
            { $skip: skip },
            { $limit: limit },
            {
                $project: {
                    userId: '$_id',
                    totalRequests: 1,
                    firstSeen: 1,
                    lastSeen: 1,
                    cities: { $filter: { input: '$cities', cond: { $ne: ['$$this', null] } } },
                    endpointCount: { $size: '$endpoints' },
                    ipAddresses: 1,
                    lastLocation: 1,
                    lastIP: 1,
                    avgResponseTime: { $round: ['$avgResponseTime', 0] },
                    _id: 0
                }
            }
        ]).option({ maxTimeMS: MAX_QUERY_MS });

        // Get total unique users count for pagination
        const totalResult = await ApiAnalytics.aggregate([
            { $match: { userId: { $exists: true, $ne: null } } },
            { $group: { _id: '$userId' } },
            { $count: 'total' }
        ]).option({ maxTimeMS: MAX_QUERY_MS });

        const totalUsers = totalResult[0]?.total || 0;

        res.json({
            users,
            pagination: {
                page,
                limit,
                totalUsers,
                totalPages: Math.ceil(totalUsers / limit),
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: Single user detail (all their activity)
router.get('/stats/users/:userId', async (req, res) => {
    try {
        const { userId } = req.params;
        const limit = parseInt(req.query.limit) || 100;

        const [apiActivity, pageViews, summary] = await Promise.all([
            // Recent API calls
            ApiAnalytics.find({ userId })
                .sort({ timestamp: -1 })
                .limit(limit)
                .select('endpoint method requestedCity requestedDate responseTime statusCode success timestamp userLocation ipAddress')
                .lean()
                .maxTimeMS(MAX_QUERY_MS),
            // Page views
            PageView.find({ userId })
                .sort({ timestamp: -1 })
                .limit(limit)
                .select('page timestamp ipAddress userLocation screenWidth screenHeight')
                .lean()
                .maxTimeMS(MAX_QUERY_MS),
            // Summary
            ApiAnalytics.aggregate([
                { $match: { userId } },
                {
                    $group: {
                        _id: null,
                        totalRequests: { $sum: 1 },
                        firstSeen: { $min: '$timestamp' },
                        lastSeen: { $max: '$timestamp' },
                        cities: { $addToSet: '$requestedCity' },
                        endpoints: { $addToSet: '$endpoint' },
                        ips: { $addToSet: '$ipAddress' },
                        avgResponseTime: { $avg: '$responseTime' },
                        locations: { $addToSet: '$userLocation.city' },
                    }
                }
            ]).option({ maxTimeMS: MAX_QUERY_MS })
        ]);

        res.json({
            userId,
            summary: summary[0] || {},
            apiActivity,
            pageViews,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: Engine usage stats
router.get('/stats/engine-usage', async (req, res) => {
    try {
        const engineStats = await ApiAnalytics.aggregate([
            { $group: { _id: '$engineUsed', count: { $sum: 1 }, avgResponseTime: { $avg: '$responseTime' } } },
            { $sort: { count: -1 } }
        ]).option({ maxTimeMS: MAX_QUERY_MS });

        res.json({ overall: engineStats });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: Trends (daily/hourly)
router.get('/stats/trends', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        const dailyTrends = await ApiAnalytics.aggregate([
            { $match: { timestamp: { $gte: startDate } } },
            { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } }, requests: { $sum: 1 }, uniqueUsers: { $addToSet: '$userId' }, avgResponseTime: { $avg: '$responseTime' } } },
            { $project: { date: '$_id', requests: 1, uniqueUsers: { $size: '$uniqueUsers' }, avgResponseTime: { $round: ['$avgResponseTime', 0] }, _id: 0 } },
            { $sort: { date: 1 } }
        ]).option({ maxTimeMS: MAX_QUERY_MS });

        res.json({ daily: dailyTrends });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
