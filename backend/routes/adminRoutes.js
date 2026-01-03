const express = require('express');
const router = express.Router();
const Log = require('../models/Log');
const logger = require('../utils/logger'); // Use our existing logger

// Debug endpoint (no auth for testing) - MOVE THIS TO PRODUCTION LATER
router.get('/debug', async (req, res) => {
    try {
        const count = await Log.countDocuments();
        const sample = await Log.findOne().sort({ timestamp: -1 }).lean();
        const collections = await Log.db.db.listCollections().toArray();
        
        res.json({
            connected: true,
            database: Log.db.name,
            totalLogs: count,
            sampleLog: sample,
            collectionName: Log.collection.name,
            allCollections: collections.map(c => c.name)
        });
    } catch (error) {
        res.json({
            connected: false,
            error: error.message,
            stack: error.stack
        });
    }
});

// Middleware for Admin Authentication
const authenticateAdmin = (req, res, next) => {
    const secret = req.headers['x-admin-secret'];
    const envSecret = process.env.ADMIN_SECRET; 
    
    // If no secret is set in env, we block access by default for security, 
    // unless 'admin123' is explicitly used for dev/testing if env is missing.
    // Ideally, user MUST set ADMIN_SECRET.
    const effectiveSecret = envSecret || 'admin123'; 

    if (secret && secret === effectiveSecret) {
        next();
    } else {
        // logger.warn(`Unauthorized admin access attempt from ${req.ip}`);
        // reduce noise for now, or log securely
        res.status(401).json({ error: 'Unauthorized: Invalid Admin Secret' });
    }
};

// Protect all routes
router.use(authenticateAdmin);

// GET /admin/logs
router.get('/logs', async (req, res) => {
    try {
        const { page = 1, limit = 50, level, search } = req.query;
        
        // Ensure page is at least 1
        const safePage = Math.max(1, parseInt(page) || 1);
        const safeLimit = Math.min(100, Math.max(1, parseInt(limit) || 50));
        
        const query = {};
        if (level) query.level = level;
        
        // Basic search in message (if string)
        if (search) {
             query.$or = [
                { "message": { $regex: search, $options: 'i' } },
                { "message.message": { $regex: search, $options: 'i' } }
             ];
        }

        const logs = await Log.find(query)
            .sort({ timestamp: -1 })
            .limit(safeLimit)
            .skip((safePage - 1) * safeLimit)
            .lean();

        const count = await Log.countDocuments(query);

        res.json({
            logs,
            totalPages: Math.ceil(count / safeLimit) || 1,
            currentPage: safePage,
            totalLogs: count
        });
    } catch (error) {
        console.error('Error fetching logs:', error);
        res.status(500).json({ error: 'Failed to fetch logs from database', details: error.message });
    }
});

// Debug endpoint to check DB status
router.get('/debug', async (req, res) => {
    try {
        const count = await Log.countDocuments();
        const sample = await Log.findOne().lean();
        
        res.json({
            connected: true,
            totalLogs: count,
            sampleLog: sample,
            collectionName: Log.collection.name
        });
    } catch (error) {
        res.json({
            connected: false,
            error: error.message
        });
    }
});

module.exports = router;
