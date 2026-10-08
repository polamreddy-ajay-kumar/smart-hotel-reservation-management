import React, { useState, useEffect } from 'react';
import '../styles/pages.css';

const ReservationManagement = () => {
  const [reservations, setReservations] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [formData, setFormData] = useState({
    customerId: '',
    roomId: '',
    checkInDate: '',
    checkOutDate: '',
    numberOfGuests: 1,
    specialRequests: ''
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
    fetchCustomers();
    fetchRooms();
  }, []);

  const fetchReservations = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/reservations');
      const data = await response.json();
      setReservations(data.data || []);
    } catch (error) {
      setReservations([
        { _id: '1', guestName: 'Rajesh', roomId: '1', checkIn: '2026-10-11', checkOut: '2026-10-14', status: 'confirmed' },
        { _id: '2', guestName: 'Ananya', roomId: '2', checkIn: '2026-10-12', checkOut: '2026-10-16', status: 'pending' }
      ]);
    }
    setLoading(false);
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/customers');
      const data = await response.json();
      setCustomers(data.data || []);
    } catch (error) {
      setCustomers([]);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rooms');
      const data = await response.json();
      setRooms(data.data || []);
    } catch (error) {
      setRooms([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const calculateNights = () => {
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      return Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = editId
        ? `http://localhost:5000/api/reservations/${editId}`
        : 'http://localhost:5000/api/reservations';
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchReservations();
        resetForm();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      customerId: '',
      roomId: '',
      checkInDate: '',
      checkOutDate: '',
      numberOfGuests: 1,
      specialRequests: ''
    });
    setEditId(null);
  };

  const handleEdit = (reservation) => {
    setFormData({
      customerId: reservation.customerId || '',
      roomId: reservation.roomId || '',
      checkInDate: reservation.checkInDate,
      checkOutDate: reservation.checkOutDate,
      numberOfGuests: reservation.numberOfGuests || 1,
      specialRequests: reservation.specialRequests || ''
    });
    setEditId(reservation._id);
  };

  const handleCancel = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/reservations/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Customer requested cancellation' })
      });
      fetchReservations();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      'pending': 'badge-pending',
      'confirmed': 'badge-confirmed',
      'checked-in': 'badge-checked-in',
      'checked-out': 'badge-checked-out',
      'cancelled': 'badge-cancelled'
    };
    return statusMap[status] || 'badge-default';
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>📅 Reservation Management</h1>
        <p>Create, modify, and track guest reservations</p>
      </div>

      <div className="form-section">
        <form onSubmit={handleSubmit} className="reservation-form">
          <div className="form-row">
            <select name="customerId" value={formData.customerId} onChange={handleChange} required>
              <option value="">Select Customer</option>
              {customers.map(customer => (
                <option key={customer._id} value={customer._id}>
                  {customer.firstName} {customer.lastName}
                </option>
              ))}
            </select>
            <select name="roomId" value={formData.roomId} onChange={handleChange} required>
              <option value="">Select Room</option>
              {rooms.filter(r => r.status === 'available').map(room => (
                <option key={room._id} value={room._id}>
                  Room {room.roomNumber} ({room.roomType}) - ₹{room.price}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row">
            <input
              type="date"
              name="checkInDate"
              value={formData.checkInDate}
              onChange={handleChange}
              required
            />
            <input
              type="date"
              name="checkOutDate"
              value={formData.checkOutDate}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <input
              type="number"
              name="numberOfGuests"
              placeholder="Number of Guests"
              value={formData.numberOfGuests}
              onChange={handleChange}
              min="1"
            />
            <input
              type="text"
              name="specialRequests"
              placeholder="Special Requests"
              value={formData.specialRequests}
              onChange={handleChange}
            />
          </div>
          {calculateNights() > 0 && (
            <div className="info-box">
              <p>📊 Reservation: <strong>{calculateNights()} nights</strong></p>
            </div>
          )}
          <button type="submit" className="btn-primary">
            {editId ? '✏️ Update Reservation' : '➕ Create Reservation'}
          </button>
          {editId && <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>}
        </form>
      </div>

      <div className="list-section">
        <h2>Reservations List</h2>
        {loading ? (
          <p>Loading...</p>
        ) : reservations.length === 0 ? (
          <p>No reservations found</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Guest</th>
                  <th>Room</th>
                  <th>Check-In</th>
                  <th>Check-Out</th>
                  <th>Guests</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {reservations.map(res => (
                  <tr key={res._id}>
                    <td>{res.guestName || 'N/A'}</td>
                    <td>Room {res.roomId}</td>
                    <td>{new Date(res.checkInDate).toLocaleDateString()}</td>
                    <td>{new Date(res.checkOutDate).toLocaleDateString()}</td>
                    <td>{res.numberOfGuests || 1}</td>
                    <td><span className={`badge ${getStatusBadge(res.status)}`}>{res.status}</span></td>
                    <td>
                      <button onClick={() => handleEdit(res)} className="btn-edit">Edit</button>
                      <button onClick={() => handleCancel(res._id)} className="btn-delete">Cancel</button>
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

export default ReservationManagement;
