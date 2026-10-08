const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/hotel_management');
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Database connection error:', error.message);
  }
};

module.exports = connectDB;
