const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/upishield');
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Instead of exiting, allow running with fallback or notice
    console.log("Ensure MongoDB is running locally on mongodb://127.0.0.1:27017 or set MONGO_URI in .env");
  }
};

module.exports = connectDB;
