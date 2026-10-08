const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const Customer = require('../models/Customer');

// Get all reservations
exports.getAllReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('customerId')
      .populate('hotelId')
      .populate('roomId');
    res.json({ success: true, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get reservation by ID
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate('customerId')
      .populate('hotelId')
      .populate('roomId');
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
    res.json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create reservation
exports.createReservation = async (req, res) => {
  try {
    const { customerId, roomId, checkInDate, checkOutDate, numberOfGuests } = req.body;
    
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ success: false, message: 'Room not found' });
    
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    const reservation = new Reservation({
      customerId,
      roomId,
      hotelId: room.hotelId,
      checkInDate,
      checkOutDate,
      numberOfNights: nights,
      numberOfGuests,
      roomPrice: room.price,
      totalPrice: room.price * nights,
      finalPrice: room.price * nights,
      ...req.body
    });
    
    await reservation.save();
    
    // Update room status
    await Room.findByIdAndUpdate(roomId, { status: 'booked' });
    
    res.status(201).json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Update reservation
exports.updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
    res.json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Cancel reservation
exports.cancelReservation = async (req, res) => {
  try {
    const { reason } = req.body;
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { 
        status: 'cancelled',
        cancellationReason: reason,
        cancellationDate: new Date()
      },
      { new: true }
    );
    
    if (reservation) {
      await Room.findByIdAndUpdate(reservation.roomId, { status: 'available' });
    }
    
    res.json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get customer reservations
exports.getCustomerReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ customerId: req.params.customerId })
      .populate('hotelId')
      .populate('roomId');
    res.json({ success: true, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check-in
exports.checkIn = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: 'checked-in' },
      { new: true }
    );
    res.json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Check-out
exports.checkOut = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: 'checked-out' },
      { new: true }
    );
    
    if (reservation) {
      await Room.findByIdAndUpdate(reservation.roomId, { status: 'available' });
    }
    
    res.json({ success: true, data: reservation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
