const mongoose = require('mongoose');

// OpenCage API Usage Tracker
const openCageUsageSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        index: true
    },
    
    // Rate Limit Info from OpenCage
    dailyLimit: {
        type: Number,
        default: 2500 // Free tier limit
    },
    totalRequests: {
        type: Number,
        default: 0
    },
    remaining: {
        type: Number,
        default: 2500
    },
    resetTime: Date,
    
    // Request breakdown
    geocodeRequests: { type: Number, default: 0 }, // City → Coordinates
    reverseGeocodeRequests: { type: Number, default: 0 }, // Coordinates → City
    
    // Status
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Ensure only one record per day
openCageUsageSchema.index({ date: 1 }, { unique: true });

// Swiss Ephemeris Engine Usage Tracker
const swissEngineUsageSchema = new mongoose.Schema({
    date: {
        type: Date,
        required: true,
        index: true
    },
    
    nativeEngine: {
        count: { type: Number, default: 0 },
        successCount: { type: Number, default: 0 },
        errorCount: { type: Number, default: 0 }
    },
    
    fallbackEngine: {
        count: { type: Number, default: 0 },
        successCount: { type: Number, default: 0 },
        errorCount: { type: Number, default: 0 }
    },
    
    // Percentage
    fallbackPercentage: {
        type: Number,
        default: 0
    },
    
    lastUpdated: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

swissEngineUsageSchema.index({ date: 1 }, { unique: true });

const OpenCageUsage = mongoose.model('OpenCageUsage', openCageUsageSchema);
const SwissEngineUsage = mongoose.model('SwissEngineUsage', swissEngineUsageSchema);

module.exports = {
    OpenCageUsage,
    SwissEngineUsage
};
