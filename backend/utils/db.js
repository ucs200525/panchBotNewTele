const mongoose = require('mongoose');

const connectDB = async () => {
    const mongoURI = process.env.MONGO_URI;
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
            maxPoolSize: 1, // Minimize connections for serverless
        });
        return mongoose.connection;
    } catch (error) {
        console.error('MongoDB connection error:', error.message);
        return null;
    }
};

module.exports = connectDB;
