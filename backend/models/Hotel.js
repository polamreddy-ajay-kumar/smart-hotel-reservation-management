const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  address: String,
  city: String,
  country: String,
  zipCode: String,
  phone: String,
  email: String,
  website: String,
  description: String,
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRooms: Number,
  amenities: [String],
  checkInTime: {
    type: String,
    default: '14:00'
  },
  checkOutTime: {
    type: String,
    default: '11:00'
  },
  image: String,
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Hotel', hotelSchema);
