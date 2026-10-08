const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');

router.get('/', paymentController.getAllPayments);
router.post('/', paymentController.createPayment);
router.post('/:id/refund', paymentController.processRefund);
router.post('/invoice/generate', paymentController.generateInvoice);
router.get('/reconciliation', paymentController.getPaymentReconciliation);

module.exports = router;
