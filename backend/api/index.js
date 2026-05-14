// Load environment variables FIRST before any other imports
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const logger = require('../utils/logger');
const requestLogger = require('../utils/requestLogger');
const panchangRoutes = require('../routes/panchangRoutes');
const planetaryRoutes = require('../routes/planetaryRoutes');
const chartsRoutes = require('../routes/chartsRoutes');
const dashaRoutes = require('../routes/dashaRoutes');
const astronomicalRoutes = require('../routes/astronomicalRoutes');
const lagnaRoutes = require('../routes/lagnaRoutes');
const newRoutes = require('../routes/newRoutes');
const adminRoutes = require('../routes/adminRoutes'); // Import Admin Routes
const analyticsRoutes = require('../routes/analyticsRoutes'); // Import Analytics Routes
const { excludeFromTracking } = require('../middleware/analytics'); // Import Analytics Middleware
const path = require('path');
const connectDB = require('../utils/db'); // Import DB Connection Helper

// Start initial DB connection (don't await - it runs in background)
connectDB().catch(err => logger.error('Initial DB connect failed: ' + err.message));

const app = express();

// Middleware for parsing JSON and Form requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Analytics Tracking Middleware - MOVED TO TOP to capture everything
app.use(excludeFromTracking(['/api/analytics', '/admin', '/analytics-dashboard.html']));

// ── Ensure DB is ready before handling requests ─────────────────────
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    res.status(503).json({ error: 'Database connection unavailable. Please retry in a few seconds.' });
  }
});


const allowedOrigins = [
  'http://localhost:3000', 
  'https://panchang-ten.vercel.app', 
  'https://panchanfrontend.vercel.app', 
  'https://panchanfrontendnew.vercel.app'
];

const corsOption = {
  origin: true, // Allow all origins temporarily to debug, or you can use a function to check .vercel.app
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-admin-secret', 'x-user-id', 'x-session-id', 'Authorization'],
  credentials: true,
};

app.use(cors(corsOption)); // apply CORS middleware


// Request Logger Middleware - logs all routes with structured JSON format
app.use(requestLogger);

// Serve static files (for analytics dashboard)
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/api', panchangRoutes);
// app.use('/api/planetary', planetaryRoutes);
// app.use('/api/charts', chartsRoutes);
// app.use('/api/dasha', dashaRoutes);
// app.use('/api/astronomical', astronomicalRoutes);
// app.use('/api/lagna', lagnaRoutes);
app.use('/admin', adminRoutes); // Mount Admin API
app.use('/api/analytics', analyticsRoutes); // Mount Analytics API (admin-protected)

// Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error(err.message || 'Internal Server Error');
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Port Configuration
const port = process.env.PORT || 4000;

// Start the server ONLY in local development
if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });
}

// Export app for serverless environment
module.exports = app;
