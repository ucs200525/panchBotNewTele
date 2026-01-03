// utils/requestLogger.js
const morgan = require('morgan');
const logger = require('./logger');

// Request/Response logging middleware with structured JSON format
const requestLogger = morgan(
  (tokens, req, res) => {
    return JSON.stringify({
      method: tokens.method(req, res),
      url: tokens.url(req, res),
      status: Number(tokens.status(req, res)),
      response_time_ms: Number(tokens['response-time'](req, res)),
      ip:
        req.headers['x-forwarded-for']?.split(',')[0] ||
        req.socket.remoteAddress
    });
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
