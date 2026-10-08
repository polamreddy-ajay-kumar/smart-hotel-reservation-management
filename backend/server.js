require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/hotel_management';

app.use(cors());
app.use(express.json());

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('booking:update', (payload) => {
    io.emit('booking:updated', payload);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const hotels = [
  {
    id: 1,
    name: 'Sunset Grand Hotel',
    city: 'Hyderabad',
    rating: 4.8,
    availableRooms: 12
  },
  {
    id: 2,
    name: 'Blue Horizon Resort',
    city: 'Bengaluru',
    rating: 4.6,
    availableRooms: 8
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

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Hotel API is running' });
});

app.get('/api/hotels', (req, res) => {
  res.json(hotels);
});

app.get('/api/rooms', (req, res) => {
  res.json(rooms);
});

app.get('/api/reservations', (req, res) => {
  res.json(reservations);
});

app.get('/api/customers', (req, res) => {
  res.json(customers);
});

app.post('/api/payments', (req, res) => {
  const { amount, method, reservationId } = req.body;

  if (!amount || !method || !reservationId) {
    return res.status(400).json({ message: 'Please provide amount, method, and reservationId' });
  }

  res.json({
    success: true,
    paymentId: `pay_${Date.now()}`,
    amount,
    method,
    reservationId,
    status: 'paid'
  });
});

app.post('/api/reservations', (req, res) => {
  const { guestName, roomId, checkIn, checkOut } = req.body;

  if (!guestName || !roomId || !checkIn || !checkOut) {
    return res.status(400).json({ message: 'Missing required reservation fields' });
  }

  const newReservation = {
    id: reservations.length + 1,
    guestName,
    roomId,
    checkIn,
    checkOut,
    status: 'confirmed'
  };

  reservations.push(newReservation);
  io.emit('booking:updated', { type: 'reservation-created', reservation: newReservation });

  res.status(201).json(newReservation);
});

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch((err) => {
    console.log('MongoDB connection failed, continuing without DB:', err.message);
  });

server.listen(PORT, () => {
  console.log(`Hotel backend running on http://localhost:${PORT}`);
});
