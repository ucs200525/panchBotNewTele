// Load environment variables FIRST before any other imports
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');
const requestLogger = require('./utils/requestLogger');
const panchangRoutes = require('./routes/panchangRoutes');
const newRoutes = require('./routes/newRoutes');
const adminRoutes = require('./routes/adminRoutes'); // Import Admin Routes
const connectDB = require('./utils/db'); // Import DB Connection Helper

// Connect to Database
connectDB();

const app = express();

// Middleware for parsing JSON requests
app.use(express.json());


const allowedOrigins = ['http://localhost:3000', 'https://panchang-ten.vercel.app'];

const corsOption = {
  origin: allowedOrigins, // allowed origins
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // allowed methods
  credentials: true, // allow credentials (cookies, authorization headers, etc.)
};

app.use(cors(corsOption)); // apply CORS middleware


// Request Logger Middleware - logs all routes with structured JSON format
app.use(requestLogger);

// Routes
// Routes
app.use('/api', panchangRoutes);
app.use('/admin', adminRoutes); // Mount Admin API


// Error Handling Middleware
app.use((err, req, res, next) => {
  logger.error(err.message || 'Internal Server Error');
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});

// Port Configuration
const port = process.env.PORT || 4000;

// Start the server
app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

// Export app for serverless environment (if needed)
module.exports = app;
