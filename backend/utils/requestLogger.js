// utils/requestLogger.js
const morgan = require('morgan');
const logger = require('./logger');
const Log = require('../models/Log');

// Request/Response logging middleware with structured JSON format
const requestLogger = morgan(
  (tokens, req, res) => {
    const logObj = {
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number(tokens.status(req, res)),
      response_time_ms: Number(tokens['response-time'](req, res)),
      ip: req.headers['x-forwarded-for']?.split(',')[0] || req.socket.remoteAddress
    };

    // Save to MongoDB asynchronously (non-blocking)
    Log.create({
      level: logObj.status >= 400 ? 'error' : 'info',
      message: `${logObj.method} ${logObj.url} ${logObj.status}`,
      meta: logObj,
      timestamp: new Date()
    }).catch(err => console.error('Log Capture Error:', err.message));

    return JSON.stringify(logObj);
  },
  {
    stream: {
      write: (message) => {
        logger.info(JSON.parse(message));
      }
    }
  }
);

module.exports = requestLogger;
