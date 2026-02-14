const mongoose = require('mongoose');
const logger = require('./logger');

// Use a global variable to store the connection state across function calls in serverless
let cachedConnection = null;
let cachedPromise = null;

const connectDB = async () => {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
        logger.warn('MONGO_URI not defined. Skipping DB connection.');
        return null;
    }

    if (cachedConnection && mongoose.connection.readyState === 1) {
        return cachedConnection;
    }

    if (!cachedPromise) {
        const options = {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10,
            minPoolSize: 2,
        };

        logger.info('Initializing new MongoDB connection...');
        cachedPromise = mongoose.connect(mongoURI, options).then((m) => {
            logger.info('MongoDB Connected Successfully');
            return m;
        }).catch(error => {
            cachedPromise = null; // Reset on failure
            logger.error('MongoDB connection error: ' + error.message);
            throw error;
        });
    }

    try {
        cachedConnection = await cachedPromise;
        
        // Setup listeners only once
        if (mongoose.connection.listeners('error').length === 0) {
            mongoose.connection.on('error', err => logger.error('Mongoose error: ' + err.message));
            mongoose.connection.on('disconnected', () => {
                logger.warn('Mongoose disconnected. Resetting cache.');
                cachedConnection = null;
                cachedPromise = null;
            });
        }
        
        return cachedConnection;
    } catch (error) {
        cachedPromise = null;
        throw error;
    }
};

module.exports = connectDB;
