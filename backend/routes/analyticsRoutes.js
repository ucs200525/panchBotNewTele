const express = require('express');
const router = express.Router();
const { ApiAnalytics, DailySummary } = require('../models/Analytics');
const Log = require('../models/Log');
const mongoose = require('mongoose');



// Admin Authentication Middleware (same as adminRoutes.js)
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

// Protect ALL analytics routes with admin auth
router.use(authenticateAdmin);

// DELETE: Clear old analytics data (space management)
router.delete('/cleanup/analytics', async (req, res) => {
    try {
        const { olderThanDays, keepCount } = req.query;

        let deletedCount = 0;

        if (olderThanDays) {
            // Delete records older than X days
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThanDays));

            const result = await ApiAnalytics.deleteMany({
                timestamp: { $lt: cutoffDate }
            });
            deletedCount = result.deletedCount;

            res.json({
                success: true,
                message: `Deleted analytics older than ${olderThanDays} days`,
                deletedCount,
                cutoffDate
            });
        } else if (keepCount) {
            // Keep only latest X records
            const totalCount = await ApiAnalytics.countDocuments();
            const keepN = parseInt(keepCount);

            if (totalCount > keepN) {
                // Find the timestamp of the Nth newest record
                const recordToKeep = await ApiAnalytics.findOne()
                    .sort({ timestamp: -1 })
                    .skip(keepN - 1)
                    .select('timestamp');

                if (recordToKeep) {
                    const result = await ApiAnalytics.deleteMany({
                        timestamp: { $lt: recordToKeep.timestamp }
                    });
                    deletedCount = result.deletedCount;
                }
            }

            res.json({
                success: true,
                message: `Kept latest ${keepN} records`,
                deletedCount,
                totalBefore: totalCount,
                totalAfter: totalCount - deletedCount
            });
        } else {
            res.status(400).json({
                error: 'Specify either olderThanDays or keepCount parameter',
                examples: [
                    '/api/analytics/cleanup/analytics?olderThanDays=30',
                    '/api/analytics/cleanup/analytics?keepCount=10000'
                ]
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Clear all analytics data
router.delete('/cleanup/analytics/all', async (req, res) => {
    try {
        const result = await ApiAnalytics.deleteMany({});
        const summaryResult = await DailySummary.deleteMany({});

        res.json({
            success: true,
            message: 'All analytics data deleted',
            analyticsDeleted: result.deletedCount,
            summariesDeleted: summaryResult.deletedCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Clear analytics by endpoint pattern (selective cleanup)
router.delete('/cleanup/analytics/selective', async (req, res) => {
    try {
        const { type } = req.query;

        let filter = {};
        let description = '';

        switch (type) {
            case 'admin':
                // Delete admin and analytics dashboard requests
                filter = {
                    $or: [
                        { endpoint: { $regex: '^/admin' } },
                        { endpoint: { $regex: '^/api/analytics' } },
                        { endpoint: '/analytics-dashboard.html' }
                    ]
                };
                description = 'admin and analytics requests';
                break;

            case 'favicon':
                // Delete favicon requests
                filter = { endpoint: '/favicon.ico' };
                description = 'favicon requests';
                break;

            case 'errors':
                // Delete failed requests only
                filter = { success: false };
                description = 'failed/error requests';
                break;

            case 'static':
                // Delete static file requests
                filter = {
                    $or: [
                        { endpoint: { $regex: '\\.(css|js|png|jpg|ico|svg)$' } },
                        { endpoint: '/favicon.ico' }
                    ]
                };
                description = 'static file requests';
                break;

            default:
                return res.status(400).json({
                    error: 'Invalid type parameter',
                    validTypes: ['admin', 'favicon', 'errors', 'static'],
                    examples: [
                        '/api/analytics/cleanup/analytics/selective?type=admin',
                        '/api/analytics/cleanup/analytics/selective?type=favicon',
                        '/api/analytics/cleanup/analytics/selective?type=errors',
                        '/api/analytics/cleanup/analytics/selective?type=static'
                    ]
                });
        }

        const result = await ApiAnalytics.deleteMany(filter);

        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} ${description}`,
            deletedCount: result.deletedCount,
            type
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Clear analytics by specific endpoint
router.delete('/cleanup/analytics/endpoint', async (req, res) => {
    try {
        const { endpoint } = req.query;

        if (!endpoint) {
            return res.status(400).json({
                error: 'Endpoint parameter required',
                example: '/api/analytics/cleanup/analytics/endpoint?endpoint=/favicon.ico'
            });
        }

        const result = await ApiAnalytics.deleteMany({ endpoint });

        res.json({
            success: true,
            message: `Deleted ${result.deletedCount} requests for endpoint: ${endpoint}`,
            deletedCount: result.deletedCount,
            endpoint
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Clear old application logs (from Log model)
router.delete('/cleanup/logs', async (req, res) => {
    try {
        const { olderThanDays, keepCount } = req.query;

        let deletedCount = 0;

        if (olderThanDays) {
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - parseInt(olderThanDays));

            const result = await Log.deleteMany({
                timestamp: { $lt: cutoffDate }
            });
            deletedCount = result.deletedCount;

            res.json({
                success: true,
                message: `Deleted logs older than ${olderThanDays} days`,
                deletedCount,
                cutoffDate
            });
        } else if (keepCount) {
            const totalCount = await Log.countDocuments();
            const keepN = parseInt(keepCount);

            if (totalCount > keepN) {
                const recordToKeep = await Log.findOne()
                    .sort({ timestamp: -1 })
                    .skip(keepN - 1)
                    .select('timestamp');

                if (recordToKeep) {
                    const result = await Log.deleteMany({
                        timestamp: { $lt: recordToKeep.timestamp }
                    });
                    deletedCount = result.deletedCount;
                }
            }

            res.json({
                success: true,
                message: `Kept latest ${keepN} logs`,
                deletedCount,
                totalBefore: totalCount,
                totalAfter: totalCount - deletedCount
            });
        } else {
            res.status(400).json({
                error: 'Specify either olderThanDays or keepCount parameter'
            });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// DELETE: Clear all logs
router.delete('/cleanup/logs/all', async (req, res) => {
    try {
        const result = await Log.deleteMany({});

        res.json({
            success: true,
            message: 'All logs deleted',
            deletedCount: result.deletedCount
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// GET: Database space usage statistics
router.get('/stats/space', async (req, res) => {
    try {
        const [analyticsCount, logsCount] = await Promise.all([
            ApiAnalytics.countDocuments(),
            Log.countDocuments()
        ]);

        // Estimate sizes (approximate)
        const avgAnalyticsSize = 500; // bytes per record
        const avgLogSize = 300; // bytes per record

        const analyticsSize = analyticsCount * avgAnalyticsSize;
        const logsSize = logsCount * avgLogSize;
        const totalSize = analyticsSize + logsSize;

        res.json({
            analytics: {
                count: analyticsCount,
                estimatedSize: `${(analyticsSize / 1024 / 1024).toFixed(2)} MB`,
                sizeBytes: analyticsSize
            },
            logs: {
                count: logsCount,
                estimatedSize: `${(logsSize / 1024 / 1024).toFixed(2)} MB`,
                sizeBytes: logsSize
            },
            total: {
                count: analyticsCount + logsCount,
                estimatedSize: `${(totalSize / 1024 / 1024).toFixed(2)} MB`,
                sizeBytes: totalSize
            },
            recommendations: getCleanupRecommendations(analyticsCount, logsCount)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Helper function for recommendations
function getCleanupRecommendations(analyticsCount, logsCount) {
    const recommendations = [];

    if (analyticsCount > 100000) {
        recommendations.push({
            type: 'analytics',
            severity: 'high',
            message: 'Analytics data exceeds 100k records. Consider cleaning old data.',
            action: 'DELETE /api/analytics/cleanup/analytics?olderThanDays=90'
        });
    } else if (analyticsCount > 50000) {
        recommendations.push({
            type: 'analytics',
            severity: 'medium',
            message: 'Analytics data growing. Monitor space usage.',
            action: 'DELETE /api/analytics/cleanup/analytics?olderThanDays=180'
        });
    }

    if (logsCount > 50000) {
        recommendations.push({
            type: 'logs',
            severity: 'high',
            message: 'Application logs exceed 50k records. Clean old logs.',
            action: 'DELETE /api/analytics/cleanup/logs?olderThanDays=30'
        });
    } else if (logsCount > 20000) {
        recommendations.push({
            type: 'logs',
            severity: 'medium',
            message: 'Logs accumulating. Consider cleanup.',
            action: 'DELETE /api/analytics/cleanup/logs?olderThanDays=60'
        });
    }

    if (recommendations.length === 0) {
        recommendations.push({
            type: 'info',
            severity: 'low',
            message: 'Database size is healthy. No action needed.'
        });
    }

    return recommendations;
}

// Get Overall Statistics
router.get('/stats/overall', async (req, res) => {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const last7Days = new Date(today);
        last7Days.setDate(last7Days.getDate() - 7);

        const last30Days = new Date(today);
        last30Days.setDate(last30Days.getDate() - 30);

        // Overall stats
        const [
            totalRequests,
            todayRequests,
            last7DaysRequests,
            uniqueUsers,
            avgResponseTime,
            errorRate
        ] = await Promise.all([
            ApiAnalytics.countDocuments(),
            ApiAnalytics.countDocuments({ timestamp: { $gte: today } }),
            ApiAnalytics.countDocuments({ timestamp: { $gte: last7Days } }),
            ApiAnalytics.distinct('sessionId').then(arr => arr.length),
            ApiAnalytics.aggregate([
                { $group: { _id: null, avg: { $avg: '$responseTime' } } }
            ]).then(r => r[0]?.avg || 0),
            ApiAnalytics.aggregate([
                {
                    $group: {
                        _id: null,
                        total: { $sum: 1 },
                        errors: { $sum: { $cond: ['$success', 0, 1] } }
                    }
                },
                { $project: { errorRate: { $multiply: [{ $divide: ['$errors', '$total'] }, 100] } } }
            ]).then(r => r[0]?.errorRate || 0)
        ]);

        res.json({
            totalRequests,
            todayRequests,
            last7DaysRequests,
            uniqueUsers,
            avgResponseTime: Math.round(avgResponseTime),
            errorRate: errorRate.toFixed(2)
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Engine Usage Statistics
router.get('/stats/engine-usage', async (req, res) => {
    try {
        const engineStats = await ApiAnalytics.aggregate([
            {
                $group: {
                    _id: '$engineUsed',
                    count: { $sum: 1 },
                    avgResponseTime: { $avg: '$responseTime' }
                }
            },
            { $sort: { count: -1 } }
        ]);

        // Engine usage by endpoint
        const engineByEndpoint = await ApiAnalytics.aggregate([
            {
                $group: {
                    _id: { endpoint: '$endpoint', engine: '$engineUsed' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);

        res.json({
            overall: engineStats,
            byEndpoint: engineByEndpoint
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Most Popular Endpoints
router.get('/stats/popular-endpoints', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const timeRange = req.query.timeRange || 'all'; // all, today, week, month

        let dateFilter = {};
        if (timeRange === 'today') {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            dateFilter = { timestamp: { $gte: today } };
        } else if (timeRange === 'week') {
            const weekAgo = new Date();
            weekAgo.setDate(weekAgo.getDate() - 7);
            dateFilter = { timestamp: { $gte: weekAgo } };
        } else if (timeRange === 'month') {
            const monthAgo = new Date();
            monthAgo.setDate(monthAgo.getDate() - 30);
            dateFilter = { timestamp: { $gte: monthAgo } };
        }

        const popularEndpoints = await ApiAnalytics.aggregate([
            { $match: dateFilter },
            {
                $group: {
                    _id: '$endpoint',
                    count: { $sum: 1 },
                    avgResponseTime: { $avg: '$responseTime' },
                    errorCount: { $sum: { $cond: ['$success', 0, 1] } }
                }
            },
            { $sort: { count: -1 } },
            { $limit: limit },
            {
                $project: {
                    endpoint: '$_id',
                    count: 1,
                    avgResponseTime: { $round: ['$avgResponseTime', 0] },
                    errorRate: {
                        $round: [{ $multiply: [{ $divide: ['$errorCount', '$count'] }, 100] }, 2]
                    },
                    _id: 0
                }
            }
        ]);

        res.json(popularEndpoints);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Most Requested Cities
router.get('/stats/popular-cities', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;

        const popularCities = await ApiAnalytics.aggregate([
            { $match: { requestedCity: { $exists: true, $ne: null } } },
            {
                $group: {
                    _id: '$requestedCity',
                    count: { $sum: 1 },
                    uniqueUsers: { $addToSet: '$sessionId' },
                    ips: { $addToSet: '$ipAddress' }
                }
            },
            {
                $project: {
                    city: '$_id',
                    requestCount: '$count',
                    uniqueUsers: { $size: '$uniqueUsers' },
                    ips: 1,
                    _id: 0
                }
            },
            { $sort: { requestCount: -1 } },
            { $limit: limit }
        ]);

        res.json(popularCities);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get User Geography (where users are from)
router.get('/stats/user-geography', async (req, res) => {
    try {
        const geography = await ApiAnalytics.aggregate([
            { $match: { 'userLocation.country': { $exists: true } } },
            {
                $group: {
                    _id: {
                        country: '$userLocation.country',
                        city: '$userLocation.city'
                    },
                    count: { $sum: 1 },
                    uniqueUsers: { $addToSet: '$sessionId' },
                    ips: { $addToSet: '$ipAddress' }
                }
            },
            {
                $project: {
                    country: '$_id.country',
                    city: '$_id.city',
                    requests: '$count',
                    users: { $size: '$uniqueUsers' },
                    ips: 1,
                    _id: 0
                }
            },
            { $sort: { requests: -1 } },
            { $limit: 50 }
        ]);

        // Group by country for summary
        const byCountry = await ApiAnalytics.aggregate([
            { $match: { 'userLocation.country': { $exists: true } } },
            {
                $group: {
                    _id: '$userLocation.country',
                    count: { $sum: 1 },
                    cities: { $addToSet: '$userLocation.city' },
                    ips: { $addToSet: '$ipAddress' }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 20 }
        ]);

        res.json({
            detailed: geography,
            byCountry: byCountry
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Per-User Statistics
router.get('/stats/per-user', async (req, res) => {
    try {
        const sessionId = req.query.sessionId;
        const limit = parseInt(req.query.limit) || 50;

        if (sessionId) {
            // Specific user stats
            const userStats = await ApiAnalytics.aggregate([
                { $match: { sessionId } },
                {
                    $facet: {
                        summary: [
                            {
                                $group: {
                                    _id: null,
                                    totalRequests: { $sum: 1 },
                                    avgResponseTime: { $avg: '$responseTime' },
                                    endpoints: { $addToSet: '$endpoint' },
                                    cities: { $addToSet: '$requestedCity' },
                                    firstRequest: { $min: '$timestamp' },
                                    lastRequest: { $max: '$timestamp' }
                                }
                            }
                        ],
                        recentActivity: [
                            { $sort: { timestamp: -1 } },
                            { $limit: 20 },
                            {
                                $project: {
                                    endpoint: 1,
                                    requestedCity: 1,
                                    timestamp: 1,
                                    responseTime: 1,
                                    engineUsed: 1
                                }
                            }
                        ]
                    }
                }
            ]);

            res.json(userStats[0]);
        } else {
            // Top users
            const topUsers = await ApiAnalytics.aggregate([
                {
                    $group: {
                        _id: '$sessionId',
                        requestCount: { $sum: 1 },
                        lastSeen: { $max: '$timestamp' },
                        endpoints: { $addToSet: '$endpoint' },
                        location: { $last: '$userLocation' },
                        ipAddress: { $last: '$ipAddress' }
                    }
                },
                { $sort: { requestCount: -1 } },
                { $limit: limit },
                {
                    $project: {
                        sessionId: '$_id',
                        requestCount: 1,
                        lastSeen: 1,
                        endpointCount: { $size: '$endpoints' },
                        location: 1,
                        ipAddress: 1,
                        _id: 0
                    }
                }
            ]);

            res.json(topUsers);
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get Time-based Analytics (hourly, daily trends)
router.get('/stats/trends', async (req, res) => {
    try {
        const days = parseInt(req.query.days) || 7;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);

        // Daily trends
        const dailyTrends = await ApiAnalytics.aggregate([
            { $match: { timestamp: { $gte: startDate } } },
            {
                $group: {
                    _id: {
                        $dateToString: { format: '%Y-%m-%d', date: '$timestamp' }
                    },
                    requests: { $sum: 1 },
                    uniqueUsers: { $addToSet: '$sessionId' },
                    avgResponseTime: { $avg: '$responseTime' },
                    nativeEngine: { $sum: { $cond: [{ $eq: ['$engineUsed', 'native'] }, 1, 0] } },
                    jsEngine: { $sum: { $cond: [{ $eq: ['$engineUsed', 'js'] }, 1, 0] } }
                }
            },
            {
                $project: {
                    date: '$_id',
                    requests: 1,
                    uniqueUsers: { $size: '$uniqueUsers' },
                    avgResponseTime: { $round: ['$avgResponseTime', 0] },
                    nativeEngine: 1,
                    jsEngine: 1,
                    _id: 0
                }
            },
            { $sort: { date: 1 } }
        ]);

        // Hourly distribution (last 24 hours)
        const last24h = new Date();
        last24h.setHours(last24h.getHours() - 24);

        const hourlyDistribution = await ApiAnalytics.aggregate([
            { $match: { timestamp: { $gte: last24h } } },
            {
                $group: {
                    _id: { $hour: '$timestamp' },
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            {
                $project: {
                    hour: '$_id',
                    count: 1,
                    _id: 0
                }
            }
        ]);

        res.json({
            daily: dailyTrends,
            hourly: hourlyDistribution
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Performance Analytics
router.get('/stats/performance', async (req, res) => {
    try {
        const performanceByEndpoint = await ApiAnalytics.aggregate([
            {
                $group: {
                    _id: '$endpoint',
                    count: { $sum: 1 },
                    avgResponseTime: { $avg: '$responseTime' },
                    minResponseTime: { $min: '$responseTime' },
                    maxResponseTime: { $max: '$responseTime' },
                    p95ResponseTime: { $percentile: { input: '$responseTime', p: [0.95], method: 'approximate' } }
                }
            },
            { $sort: { avgResponseTime: -1 } },
            {
                $project: {
                    endpoint: '$_id',
                    count: 1,
                    avgResponseTime: { $round: ['$avgResponseTime', 0] },
                    minResponseTime: { $round: ['$minResponseTime', 0] },
                    maxResponseTime: { $round: ['$maxResponseTime', 0] },
                    p95ResponseTime: { $round: [{ $arrayElemAt: ['$p95ResponseTime', 0] }, 0] },
                    _id: 0
                }
            }
        ]);

        res.json(performanceByEndpoint);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
