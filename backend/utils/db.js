const mongoose = require('mongoose');
const logger = require('./logger');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGO_URI;
    if (!mongoURI) {
      logger.warn('MONGO_URI is not defined in environment variables. Database connection skipped.');
      return;
    }

    await mongoose.connect(mongoURI, {
    //   useNewUrlParser: true,
    //   useUnifiedTopology: true,
    });

    logger.info('MongoDB Connected Successfully');
  } catch (error) {
    logger.error('MongoDB connection error: ' + error.message);
    // process.exit(1); // Don't exit, just log failure so app can still run without DB
  }
};

module.exports = connectDB;
