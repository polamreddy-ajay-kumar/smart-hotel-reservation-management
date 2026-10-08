const Payment = require('../models/Payment');
const Invoice = require('../models/Invoice');
const Reservation = require('../models/Reservation');

// Get all payments
exports.getAllPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('reservationId')
      .populate('customerId')
      .populate('hotelId');
    res.json({ success: true, data: payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Create payment
exports.createPayment = async (req, res) => {
  try {
    const { reservationId, customerId, hotelId, amount, method } = req.body;
    
    const payment = new Payment({
      reservationId,
      customerId,
      hotelId,
      amount,
      method,
      transactionId: `TXN_${Date.now()}`,
      status: 'completed',
      paymentDate: new Date()
    });
    
    await payment.save();
    
    // Update reservation payment status
    await Reservation.findByIdAndUpdate(
      reservationId,
      { paymentStatus: 'completed' }
    );
    
    res.status(201).json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Process refund
exports.processRefund = async (req, res) => {
  try {
    const { refundAmount, reason } = req.body;
    
    const payment = await Payment.findByIdAndUpdate(
      req.params.id,
      {
        status: 'refunded',
        'refundInfo.refunded': true,
        'refundInfo.refundAmount': refundAmount,
        'refundInfo.refundDate': new Date(),
        'refundInfo.refundReason': reason
      },
      { new: true }
    );
    
    if (payment) {
      await Reservation.findByIdAndUpdate(
        payment.reservationId,
        { paymentStatus: 'refunded' }
      );
    }
    
    res.json({ success: true, data: payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Generate invoice
exports.generateInvoice = async (req, res) => {
  try {
    const { reservationId, paymentMethod, notes } = req.body;
    
    const reservation = await Reservation.findById(reservationId);
    if (!reservation) return res.status(404).json({ success: false, message: 'Reservation not found' });
    
    const invoiceNumber = `INV_${Date.now()}`;
    const taxes = Math.round(reservation.finalPrice * 0.18);
    
    const invoice = new Invoice({
      invoiceNumber,
      reservationId,
      customerId: reservation.customerId,
      hotelId: reservation.hotelId,
      roomPrice: reservation.roomPrice,
      numberOfNights: reservation.numberOfNights,
      subtotal: reservation.finalPrice,
      taxes,
      discount: reservation.discountApplied || 0,
      totalAmount: reservation.finalPrice + taxes - (reservation.discountApplied || 0),
      paymentMethod,
      paymentStatus: 'paid',
      paidDate: new Date(),
      notes
    });
    
    await invoice.save();
    res.status(201).json({ success: true, data: invoice });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get payment reconciliation
exports.getPaymentReconciliation = async (req, res) => {
  try {
    const { startDate, endDate, hotelId } = req.query;
    
    const query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }
    if (hotelId) query.hotelId = hotelId;
    
    const payments = await Payment.find(query);
    
    const summary = {
      totalPayments: payments.length,
      totalAmount: payments.reduce((sum, p) => sum + p.amount, 0),
      completedPayments: payments.filter(p => p.status === 'completed').length,
      pendingPayments: payments.filter(p => p.status === 'pending').length,
      failedPayments: payments.filter(p => p.status === 'failed').length,
      refundedPayments: payments.filter(p => p.status === 'refunded').length,
      totalRefunded: payments
        .filter(p => p.refundInfo && p.refundInfo.refunded)
        .reduce((sum, p) => sum + (p.refundInfo.refundAmount || 0), 0)
    };
    
    res.json({ success: true, data: { payments, summary } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
