// utils/logger.js
const winston = require('winston');
const Log = require('../models/Log');

const transports = [
  new winston.transports.Console()
];

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: transports
});

// Monkey-patch logger to also save to MongoDB for the Admin Dashboard
// This is "direct and fast" without the overhead of winston-mongodb connection management
const originalInfo = logger.info.bind(logger);
const originalError = logger.error.bind(logger);
const originalWarn = logger.warn.bind(logger);

logger.info = (msg, meta) => {
  saveToDb('info', msg, meta);
  return originalInfo(msg, meta);
};

logger.error = (msg, meta) => {
  saveToDb('error', msg, meta);
  return originalError(msg, meta);
};

logger.warn = (msg, meta) => {
  saveToDb('warn', msg, meta);
  return originalWarn(msg, meta);
};

function saveToDb(level, message, meta) {
  // Only save if it's not a heartbeat/debug message to keep DB clean
  if (typeof message === 'string' && (message.includes('Logger initialized') || message.includes('Server is running'))) return;

  Log.create({
    level,
    message: typeof message === 'object' ? JSON.stringify(message) : message,
    meta,
    timestamp: new Date()
  }).catch(err => {
    // Fail silently in DB to avoid infinite loops if it logs to itself
  });
}

module.exports = logger;
