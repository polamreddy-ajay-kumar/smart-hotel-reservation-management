require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

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

// Fallback demo data for UI if DB is not connected yet
const hotels = [
  {
    id: 1,
    name: 'Sunset Grand Hotel',
    city: 'Hyderabad',
    rating: 4.8,
    availableRooms: 12,
    amenities: ['Wi-Fi', 'Pool', 'Parking']
  },
  {
    id: 2,
    name: 'Blue Horizon Resort',
    city: 'Bengaluru',
    rating: 4.6,
    availableRooms: 8,
    amenities: ['Gym', 'Restaurant', 'Spa']
  }
];

const rooms = [
  { id: 1, roomNumber: '101', type: 'Deluxe', price: 3200, status: 'available', hotelId: 1 },
  { id: 2, roomNumber: '102', type: 'Suite', price: 4800, status: 'booked', hotelId: 1 },
  { id: 3, roomNumber: '201', type: 'Standard', price: 2200, status: 'available', hotelId: 2 }
];

const reservations = [
  { id: 1, guestName: 'Rajesh', roomId: 1, checkIn: '2026-10-11', checkOut: '2026-10-14', status: 'confirmed' },
  { id: 2, guestName: 'Ananya', roomId: 2, checkIn: '2026-10-12', checkOut: '2026-10-16', status: 'pending' }
];

const customers = [
  { id: 1, name: 'Rajesh', email: 'rajesh@example.com', phone: '9876543210' },
  { id: 2, name: 'Ananya', email: 'ananya@example.com', phone: '9123456780' }
];

app.get('/api/demo/hotels', (req, res) => res.json(hotels));
app.get('/api/demo/rooms', (req, res) => res.json(rooms));
app.get('/api/demo/reservations', (req, res) => res.json(reservations));
app.get('/api/demo/customers', (req, res) => res.json(customers));

app.post('/api/demo/payments', (req, res) => {
  const { amount, method, reservationId } = req.body;

  if (!amount || !method || !reservationId) {
    return res.status(400).json({ message: 'Please provide amount, method, and reservationId' });
  }

  const payment = {
    success: true,
    paymentId: `pay_${Date.now()}`,
    amount,
    method,
    reservationId,
    status: 'paid'
  };

  io.emit('booking:updated', { type: 'payment-created', payment });
  res.status(201).json(payment);
});

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.log('MongoDB not available, running in demo mode:', error.message);
  }
};

connectDB();

server.listen(PORT, () => {
  console.log(`Hotel management server running on http://localhost:${PORT}`);
});
