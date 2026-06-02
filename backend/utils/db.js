const mongoose = require('mongoose');

const connectDB = async () => {
    // Disable buffering globally so operations fail instantly if MongoDB is offline,
    // avoiding the 10000ms command buffering timeout lag in local/offline environments.
    mongoose.set('bufferCommands', false);

    const mongoURI = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoURI) {
        return null;
    }

    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    try {
        await mongoose.connect(mongoURI, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
            maxPoolSize: 10, // Optimize connection pool size for Express parallel queries
            w: 1
        });
        return mongoose.connection;
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        return null;
    }
};

module.exports = connectDB;
