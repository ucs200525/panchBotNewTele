const { OpenCageUsage } = require('../models/ThirdPartyUsage');

/**
 * Track OpenCage API request
 * @param {string} type - 'geocode' or 'reverse_geocode'
 * @param {object} rateInfo - { limit, remaining, reset } from OpenCage response
 */
async function trackOpenCageRequest(type = 'geocode', rateInfo = {}) {
    // Tracking disabled to avoid MongoDB connection issues
    return;
    /*
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const updateData = {
            lastUpdated: new Date(),
            dailyLimit: rateInfo.limit || 2500,
            remaining: rateInfo.remaining !== undefined ? rateInfo.remaining : 2500,
            resetTime: rateInfo.reset ? new Date(rateInfo.reset * 1000) : null,
            $inc: {
                totalRequests: 1,
                [type === 'reverse_geocode' ? 'reverseGeocodeRequests' : 'geocodeRequests']: 1
            }
        };
        
        await OpenCageUsage.findOneAndUpdate(
            { date: today },
            updateData,
            { upsert: true, new: true }
        );
    } catch (error) {
        console.error('Error tracking OpenCage request:', error.message);
        // Don't throw - tracking shouldn't break the main app
    }
    */
}

/**
 * Get current OpenCage usage stats
 */
async function getOpenCageStats() {
    try {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Fail fast if database is not connected
        const mongoose = require('mongoose');
        if (mongoose.connection.readyState !== 1) {
            return {
                dailyLimit: 2500,
                used: 0,
                remaining: 2500,
                geocodeRequests: 0,
                reverseGeocodeRequests: 0,
                percentage: 0,
                resetTime: null,
                status: 'offline'
            };
        }
        
        const todayStats = await OpenCageUsage.findOne({ date: today });
        
        if (!todayStats) {
            return {
                dailyLimit: 2500,
                used: 0,
                remaining: 2500,
                geocodeRequests: 0,
                reverseGeocodeRequests: 0,
                percentage: 0,
                resetTime: null
            };
        }
        
        const used = todayStats.totalRequests || 0;
        const remaining = todayStats.remaining !== undefined ? todayStats.remaining : (todayStats.dailyLimit - used);
        const percentage = ((used / todayStats.dailyLimit) * 100).toFixed(1);
        
        return {
            dailyLimit: todayStats.dailyLimit,
            used,
            remaining,
            geocodeRequests: todayStats.geocodeRequests || 0,
            reverseGeocodeRequests: todayStats.reverseGeocodeRequests || 0,
            percentage,
            resetTime: todayStats.resetTime
        };
    } catch (error) {
        console.error('Error getting OpenCage stats:', error.message);
        return {
            dailyLimit: 2500,
            used: 0,
            remaining: 2500,
            geocodeRequests: 0,
            reverseGeocodeRequests: 0,
            percentage: 0,
            resetTime: null,
            error: error.message
        };
    }
}

/**
 * Get OpenCage usage history (last N days)
 */
async function getOpenCageHistory(days = 7) {
    try {
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        startDate.setHours(0, 0, 0, 0);
        
        const history = await OpenCageUsage.find({
            date: { $gte: startDate }
        })
        .sort({ date: -1 })
        .lean();
        
        return history.map(day => ({
            date: day.date,
            used: day.totalRequests,
            remaining: day.remaining,
            geocode: day.geocodeRequests,
            reverseGeocode: day.reverseGeocodeRequests,
            percentage: ((day.totalRequests / day.dailyLimit) * 100).toFixed(1)
        }));
    } catch (error) {
        console.error('Error getting OpenCage history:', error.message);
        return [];
    }
}

module.exports = {
    trackOpenCageRequest,
    getOpenCageStats,
    getOpenCageHistory
};
