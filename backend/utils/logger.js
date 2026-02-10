// utils/logger.js
const winston = require('winston');

// Load winston-mongodb with proper error handling
let MongoDB;
try {
  MongoDB = require('winston-mongodb').MongoDB;
  console.log('✓ winston-mongodb loaded successfully');
} catch (e) {
  console.warn('✗ winston-mongodb not available:', e.message);
}

const transports = [
  new winston.transports.Console()
];

// Add MongoDB transport if URI is available and MongoDB transport is loaded
// MongoDB transport disabled as requested to avoid connection issues
/*
if (process.env.MONGO_URI && MongoDB) {
  try {
    const mongoTransport = new MongoDB({
      level: 'info',
      db: process.env.MONGO_URI,
      options: {
        useUnifiedTopology: true,
        useNewUrlParser: true
      },
      collection: 'logs',
      storeHost: true,
      capped: false,
      cappedSize: 10000000, // 10MB
      tryReconnect: true,
      decolorize: true,
      leaveConnectionOpen: false,
      metaKey: 'meta'
    });

    // Listen for errors from MongoDB transport
    mongoTransport.on('error', (error) => {
      console.error('MongoDB Transport Error:', error);
    });

    mongoTransport.on('logged', (info) => {
      console.log('✓ Log written to MongoDB');
    });

    transports.push(mongoTransport);
    console.log('✓ MongoDB transport added to Winston');
  } catch (error) {
    console.error('✗ Failed to create MongoDB transport:', error.message);
  }
} else {
  if (!process.env.MONGO_URI) {
    console.warn('⚠ MONGO_URI not set - logs will only appear in console');
  }
  if (!MongoDB) {
    console.warn('⚠ MongoDB transport not available');
  }
}
*/

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: transports
});

// Log a test message on startup
logger.info({ message: 'Logger initialized', mongoEnabled: !!MongoDB && !!process.env.MONGO_URI });

module.exports = logger;
