const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');

router.get('/', roomController.getAllRooms);
router.get('/hotel/:hotelId', roomController.getRoomsByHotel);
router.get('/available/search', roomController.getAvailableRooms);
router.post('/', roomController.createRoom);
router.put('/:id', roomController.updateRoom);
router.delete('/:id', roomController.deleteRoom);
router.post('/bulk-update', roomController.bulkUpdateRooms);
router.patch('/:id/status', roomController.changeRoomStatus);

module.exports = router;
