const mongoose = require('mongoose');

// API Request Analytics Schema
const apiAnalyticsSchema = new mongoose.Schema({
    // Request Info
    endpoint: {
        type: String,
        required: true,
        index: true
    },
    method: {
        type: String,
        required: true
    },

    // User Info
    userId: {
        type: String,
        index: true
    },
    sessionId: String, // Legacy - kept for backward compatibility
    ipAddress: {
        type: String,
        index: true
    },

    // User Location (resolved from IP)
    userLocation: {
        country: String,
        countryCode: String,
        city: String,
        region: String,
        timezone: String,
        isp: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },

    // Requested Data
    requestedCity: String, // City they searched for panchang
    requestedDate: String,

    // Engine Info
    engineUsed: {
        type: String,
        default: 'unknown'
    },

    // Performance Metrics
    responseTime: Number, // in milliseconds
    statusCode: Number,
    success: Boolean,
    errorMessage: String,

    // Metadata
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    },
    userAgent: String,
    referer: String
}, {
    timestamps: true
});

// Optimized indexes for the queries we actually run
apiAnalyticsSchema.index({ timestamp: -1 });
apiAnalyticsSchema.index({ userId: 1, timestamp: -1 });
apiAnalyticsSchema.index({ endpoint: 1, timestamp: -1 });
apiAnalyticsSchema.index({ requestedCity: 1 });
apiAnalyticsSchema.index({ ipAddress: 1 });

// ── Page View Schema ───────────────────────────────────────────────
const pageViewSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true
    },
    page: {
        type: String,
        required: true,
        index: true
    },
    ipAddress: String,
    userLocation: {
        country: String,
        countryCode: String,
        city: String,
        region: String
    },
    screenWidth: Number,
    screenHeight: Number,
    referrer: String,
    userAgent: String,
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, {
    timestamps: true
});

pageViewSchema.index({ userId: 1, timestamp: -1 });
pageViewSchema.index({ page: 1, timestamp: -1 });

// ── Daily Summary Schema (for faster dashboard queries) ────────────
const dailySummarySchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        unique: true
    },

    // Overall Stats
    totalRequests: { type: Number, default: 0 },
    uniqueUsers: { type: Number, default: 0 },
    avgResponseTime: { type: Number, default: 0 },
    errorRate: { type: Number, default: 0 },

    // Engine Usage
    nativeEngineCount: { type: Number, default: 0 },
    jsEngineCount: { type: Number, default: 0 },

    // Top Endpoints
    topEndpoints: [{
        endpoint: String,
        count: Number
    }],

    // Top Cities
    topCities: [{
        city: String,
        count: Number
    }],

    // Top User Locations
    topUserCountries: [{
        country: String,
        count: Number
    }],

    // Hourly Distribution
    hourlyDistribution: [{
        hour: Number,
        count: Number
    }]
}, {
    timestamps: true
});

const ApiAnalytics = mongoose.model('ApiAnalytics', apiAnalyticsSchema);
const PageView = mongoose.model('PageView', pageViewSchema);
const DailySummary = mongoose.model('DailySummary', dailySummarySchema);

module.exports = {
    ApiAnalytics,
    PageView,
    DailySummary
};
