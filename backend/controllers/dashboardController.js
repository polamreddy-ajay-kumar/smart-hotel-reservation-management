const Hotel = require('../models/Hotel');
const Room = require('../models/Room');
const Reservation = require('../models/Reservation');
const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const User = require('../models/User');

// Get dashboard statistics
exports.getDashboardStats = async (req, res) => {
  try {
    const totalHotels = await Hotel.countDocuments({ status: 'active' });
    const totalRooms = await Room.countDocuments();
    const totalReservations = await Reservation.countDocuments();
    const totalCustomers = await Customer.countDocuments();
    const totalUsers = await User.countDocuments();

    const availableRooms = await Room.countDocuments({ status: 'available' });
    const bookedRooms = await Room.countDocuments({ status: 'booked' });
    
    const confirmedReservations = await Reservation.countDocuments({ status: 'confirmed' });
    const pendingReservations = await Reservation.countDocuments({ status: 'pending' });
    
    const payments = await Payment.find().select('amount status');
    const totalRevenue = payments.reduce((sum, p) => sum + (p.status === 'completed' ? p.amount : 0), 0);
    const pendingPayments = payments.filter(p => p.status === 'pending');
    const totalPendingAmount = pendingPayments.reduce((sum, p) => sum + p.amount, 0);

    res.json({
      success: true,
      data: {
        hotels: {
          total: totalHotels
        },
        rooms: {
          total: totalRooms,
          available: availableRooms,
          booked: bookedRooms
        },
        reservations: {
          total: totalReservations,
          confirmed: confirmedReservations,
          pending: pendingReservations
        },
        customers: {
          total: totalCustomers
        },
        users: {
          total: totalUsers
        },
        revenue: {
          total: totalRevenue,
          pending: totalPendingAmount
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get recent reservations
exports.getRecentReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate('customerId')
      .populate('hotelId')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({ success: true, data: reservations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get revenue chart data (monthly)
exports.getRevenueChartData = async (req, res) => {
  try {
    const payments = await Payment.find({ status: 'completed' });
    
    const monthlyData = {};
    payments.forEach(payment => {
      const date = new Date(payment.createdAt);
      const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[month] = (monthlyData[month] || 0) + payment.amount;
    });

    const chartData = Object.entries(monthlyData).map(([month, amount]) => ({
      month,
      amount
    }));

    res.json({ success: true, data: chartData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get occupancy rate
exports.getOccupancyRate = async (req, res) => {
  try {
    const hotels = await Hotel.find();
    
    const occupancyData = [];
    for (const hotel of hotels) {
      const totalRooms = await Room.countDocuments({ hotelId: hotel._id });
      const bookedRooms = await Room.countDocuments({ hotelId: hotel._id, status: 'booked' });
      const occupancyRate = totalRooms > 0 ? (bookedRooms / totalRooms * 100).toFixed(2) : 0;
      
      occupancyData.push({
        hotelId: hotel._id,
        hotelName: hotel.name,
        totalRooms,
        bookedRooms,
        occupancyRate
      });
    }

    res.json({ success: true, data: occupancyData });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get top customers
exports.getTopCustomers = async (req, res) => {
  try {
    const customers = await Customer.find()
      .sort({ totalSpent: -1 })
      .limit(10);
    
    res.json({ success: true, data: customers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
