// backend/config/mongo.js
const mongoose = require('mongoose');

// Function to connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected Successfully for Logs');
    } catch (error) {
        console.error('MongoDB Connection Error:', error);
        process.exit(1); // Exit process with failure if connection fails
    }
};

module.exports = connectDB;