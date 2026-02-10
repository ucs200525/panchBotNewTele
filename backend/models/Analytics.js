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
    userId: String, // If you implement user auth later
    sessionId: String, // Browser fingerprint
    ipAddress: String,

    // Location Info
    userLocation: {
        country: String,
        city: String,
        region: String,
        timezone: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },

    // Requested Data
    requestedCity: String, // City they searched for
    requestedDate: Date,

    // Engine Info
    engineUsed: {
        type: String,
        enum: ['native', 'js', 'unknown'],
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

// Indexes for fast queries
apiAnalyticsSchema.index({ timestamp: -1 });
apiAnalyticsSchema.index({ endpoint: 1, timestamp: -1 });
apiAnalyticsSchema.index({ sessionId: 1, timestamp: -1 });
apiAnalyticsSchema.index({ requestedCity: 1, timestamp: -1 });
apiAnalyticsSchema.index({ engineUsed: 1 });

// Daily Summary Schema (for faster dashboard queries)
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
const DailySummary = mongoose.model('DailySummary', dailySummarySchema);

module.exports = {
    ApiAnalytics,
    DailySummary
};
