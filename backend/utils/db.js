const mongoose = require('mongoose');
const logger = require('./logger');

// ── Cached connection for serverless (Vercel) ───────────────────────
// In serverless environments, each request can cold-start a new instance.
// We cache the connection promise in `global` so it survives across
// warm invocations and isn't re-created every time.
let cached = global._mongooseCache;
if (!cached) {
  cached = global._mongooseCache = { conn: null, promise: null };
}

const connectDB = async () => {
  const mongoURI = process.env.MONGO_URI;
  if (!mongoURI) {
    logger.warn('MONGO_URI is not defined. Database connection skipped.');
    return null;
  }

  // If already connected, return immediately
  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  // If connection is in progress, wait for it (don't create a second one)
  if (cached.promise) {
    try {
      cached.conn = await cached.promise;
      return cached.conn;
    } catch (e) {
      // Previous attempt failed, reset and try again
      cached.promise = null;
    }
  }

  // Create a new connection
  cached.promise = mongoose.connect(mongoURI, {
    serverSelectionTimeoutMS: 10000,  // 10s to find a server
    socketTimeoutMS: 30000,           // 30s for operations
    maxPoolSize: 5,                   // Small pool for serverless
    bufferCommands: false,            // Fail fast instead of buffering for 10s
  });

  try {
    cached.conn = await cached.promise;
    logger.info('MongoDB Connected Successfully');
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    logger.error('MongoDB connection error: ' + error.message);
    throw error;
  }
};

module.exports = connectDB;
