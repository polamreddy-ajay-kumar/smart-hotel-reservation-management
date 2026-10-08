const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authMiddleware } = require('../middleware/auth');

router.get('/stats', authMiddleware, dashboardController.getDashboardStats);
router.get('/recent-reservations', authMiddleware, dashboardController.getRecentReservations);
router.get('/revenue-chart', authMiddleware, dashboardController.getRevenueChartData);
router.get('/occupancy', authMiddleware, dashboardController.getOccupancyRate);
router.get('/top-customers', authMiddleware, dashboardController.getTopCustomers);

module.exports = router;
