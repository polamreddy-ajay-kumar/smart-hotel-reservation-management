const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');

router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);
router.post('/', customerController.createCustomer);
router.put('/:id', customerController.updateCustomer);
router.put('/:id/preferences', customerController.updatePreferences);
router.post('/:id/loyalty/enroll', customerController.enrollLoyaltyProgram);
router.post('/:id/loyalty/points', customerController.addLoyaltyPoints);

module.exports = router;
