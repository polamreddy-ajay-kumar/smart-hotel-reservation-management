import React, { useState, useEffect } from 'react';
import '../styles/pages.css';

const PaymentManagement = () => {
  const [payments, setPayments] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [formData, setFormData] = useState({
    reservationId: '',
    amount: 0,
    method: 'credit_card'
  });
  const [loading, setLoading] = useState(true);
  const [summary, setSummary] = useState(null);
  const [invoiceForm, setInvoiceForm] = useState({
    reservationId: '',
    paymentMethod: 'credit_card'
  });

  useEffect(() => {
    fetchPayments();
    fetchReservations();
    fetchReconciliation();
  }, []);

  const fetchPayments = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/payments');
      const data = await response.json();
      setPayments(data.data || []);
    } catch (error) {
      setPayments([]);
    }
    setLoading(false);
  };

  const fetchReservations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reservations');
      const data = await response.json();
      setReservations(data.data || []);
    } catch (error) {
      setReservations([]);
    }
  };

  const fetchReconciliation = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/payments/reconciliation');
      const data = await response.json();
      setSummary(data.data?.summary);
    } catch (error) {
      console.log('Reconciliation not available');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'amount' ? parseFloat(value) : value
    }));
  };

  const handleInvoiceChange = (e) => {
    const { name, value } = e.target;
    setInvoiceForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchPayments();
        fetchReconciliation();
        setFormData({
          reservationId: '',
          amount: 0,
          method: 'credit_card'
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleGenerateInvoice = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/payments/invoice/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceForm)
      });

      if (response.ok) {
        const data = await response.json();
        alert(`Invoice ${data.data.invoiceNumber} generated successfully!`);
        setInvoiceForm({
          reservationId: '',
          paymentMethod: 'credit_card'
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleRefund = async (paymentId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refundAmount: formData.amount,
          reason: 'Customer requested refund'
        })
      });

      if (response.ok) {
        fetchPayments();
        fetchReconciliation();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': 'badge-pending',
      'completed': 'badge-completed',
      'failed': 'badge-failed',
      'refunded': 'badge-refunded'
    };
    return statusMap[status] || 'badge-default';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>💳 Payment Management</h1>
        <p>Process payments, generate invoices, and handle refunds</p>
      </div>

      {summary && (
        <div className="summary-section">
          <div className="summary-card">
            <h3>Total Payments</h3>
            <p className="summary-value">₹{summary.totalAmount?.toLocaleString()}</p>
          </div>
          <div className="summary-card">
            <h3>Completed</h3>
            <p className="summary-value">{summary.completedPayments}</p>
          </div>
          <div className="summary-card">
            <h3>Pending</h3>
            <p className="summary-value">{summary.pendingPayments}</p>
          </div>
          <div className="summary-card">
            <h3>Refunded</h3>
            <p className="summary-value">₹{summary.totalRefunded?.toLocaleString()}</p>
          </div>
        </div>
      )}

      <div className="form-section">
        <div className="form-group">
          <h3>Process Payment</h3>
          <form onSubmit={handlePaymentSubmit} className="payment-form">
            <div className="form-row">
              <select name="reservationId" value={formData.reservationId} onChange={handleChange} required>
                <option value="">Select Reservation</option>
                {reservations.map(res => (
                  <option key={res._id} value={res._id}>
                    Res #{res._id.slice(0, 8)} - {res.guestName} - ₹{res.totalPrice}
                  </option>
                ))}
              </select>
              <input
                type="number"
                name="amount"
                placeholder="Amount"
                value={formData.amount}
                onChange={handleChange}
                required
                step="0.01"
              />
            </div>
            <div className="form-row">
              <select name="method" value={formData.method} onChange={handleChange}>
                <option value="credit_card">Credit Card</option>
                <option value="debit_card">Debit Card</option>
                <option value="net_banking">Net Banking</option>
                <option value="wallet">Wallet</option>
                <option value="upi">UPI</option>
              </select>
            </div>
            <button type="submit" className="btn-primary">💸 Process Payment</button>
          </form>
        </div>

        <div className="form-group">
          <h3>Generate Invoice</h3>
          <form onSubmit={handleGenerateInvoice} className="invoice-form">
            <div className="form-row">
              <select name="reservationId" value={invoiceForm.reservationId} onChange={handleInvoiceChange} required>
                <option value="">Select Reservation</option>
                {reservations.map(res => (
                  <option key={res._id} value={res._id}>
                    Res #{res._id.slice(0, 8)} - {res.guestName}
                  </option>
                ))}
              </select>
              <select name="paymentMethod" value={invoiceForm.paymentMethod} onChange={handleInvoiceChange}>
                <option value="credit_card">Credit Card</option>
                <option value="cash">Cash</option>
                <option value="check">Check</option>
              </select>
            </div>
            <button type="submit" className="btn-primary">📄 Generate Invoice</button>
          </form>
        </div>
      </div>

      <div className="list-section">
        <h2>Payments List</h2>
        {loading ? (
          <p>Loading...</p>
        ) : payments.length === 0 ? (
          <p>No payments found</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map(payment => (
                  <tr key={payment._id}>
                    <td>{payment.transactionId}</td>
                    <td>₹{payment.amount.toLocaleString()}</td>
                    <td>{payment.method}</td>
                    <td><span className={`badge ${getStatusBadge(payment.status)}`}>{payment.status}</span></td>
                    <td>{new Date(payment.paymentDate).toLocaleDateString()}</td>
                    <td>
                      {payment.status === 'completed' && (
                        <button onClick={() => handleRefund(payment._id)} className="btn-delete">Refund</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentManagement;
