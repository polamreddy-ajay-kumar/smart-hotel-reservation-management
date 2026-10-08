require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const hotelRoutes = require('./routes/hotels');
const roomRoutes = require('./routes/rooms');
const reservationRoutes = require('./routes/reservations');
const customerRoutes = require('./routes/customers');
const paymentRoutes = require('./routes/payments');
const socketHandler = require('./middleware/socketHandler');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE']
  }
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hotel_management';

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/payments', paymentRoutes);

// Real-time events
socketHandler(io);

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    message: 'Hotel management API is running',
    timestamp: new Date().toISOString()
  });
});

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    console.log('⚠️ Running in demo mode without database');
  }
};

connectDB();

server.listen(PORT, () => {
  console.log(`🏨 Hotel management server running on http://localhost:${PORT}`);
  console.log(`📊 API Documentation at http://localhost:${PORT}/api/health`);
});
