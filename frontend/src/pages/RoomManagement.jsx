import React, { useState, useEffect } from 'react';
import '../styles/pages.css';

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [formData, setFormData] = useState({
    hotelId: '',
    roomNumber: '',
    roomType: 'Standard',
    capacity: 2,
    price: 0,
    bedType: 'Double',
    floor: 1,
    amenities: '',
    status: 'available'
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRooms();
    fetchHotels();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rooms');
      const data = await response.json();
      setRooms(data.data || []);
    } catch (error) {
      setRooms([
        { _id: '1', roomNumber: '101', roomType: 'Deluxe', price: 3200, status: 'available' },
        { _id: '2', roomNumber: '102', roomType: 'Suite', price: 4800, status: 'booked' }
      ]);
    }
    setLoading(false);
  };

  const fetchHotels = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/hotels');
      const data = await response.json();
      setHotels(data.data || []);
    } catch (error) {
      setHotels([]);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'capacity' || name === 'price' || name === 'floor' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const amenitiesArray = formData.amenities.split(',').map(a => a.trim()).filter(a => a);
      const payload = {
        ...formData,
        amenities: amenitiesArray
      };

      const url = editId
        ? `http://localhost:5000/api/rooms/${editId}`
        : 'http://localhost:5000/api/rooms';
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        fetchRooms();
        resetForm();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      hotelId: '',
      roomNumber: '',
      roomType: 'Standard',
      capacity: 2,
      price: 0,
      bedType: 'Double',
      floor: 1,
      amenities: '',
      status: 'available'
    });
    setEditId(null);
  };

  const handleEdit = (room) => {
    setFormData({
      hotelId: room.hotelId || '',
      roomNumber: room.roomNumber,
      roomType: room.roomType,
      capacity: room.capacity,
      price: room.price,
      bedType: room.bedType || 'Double',
      floor: room.floor || 1,
      amenities: (room.amenities || []).join(', '),
      status: room.status
    });
    setEditId(room._id);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/rooms/${id}`, { method: 'DELETE' });
      fetchRooms();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch(status) {
      case 'available':
        return 'badge-available';
      case 'booked':
        return 'badge-booked';
      case 'maintenance':
        return 'badge-maintenance';
      default:
        return 'badge-unavailable';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🛏️ Room Management</h1>
        <p>Add and manage hotel rooms, pricing, and availability</p>
      </div>

      <div className="form-section">
        <form onSubmit={handleSubmit} className="room-form">
          <div className="form-row">
            <select name="hotelId" value={formData.hotelId} onChange={handleChange}>
              <option value="">Select Hotel</option>
              {hotels.map(hotel => (
                <option key={hotel._id} value={hotel._id}>{hotel.name}</option>
              ))}
            </select>
            <input
              type="text"
              name="roomNumber"
              placeholder="Room Number"
              value={formData.roomNumber}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <select name="roomType" value={formData.roomType} onChange={handleChange}>
              <option>Standard</option>
              <option>Deluxe</option>
              <option>Suite</option>
              <option>Presidential</option>
            </select>
            <select name="bedType" value={formData.bedType} onChange={handleChange}>
              <option>Single</option>
              <option>Double</option>
              <option>Twin</option>
              <option>King</option>
            </select>
          </div>
          <div className="form-row">
            <input
              type="number"
              name="capacity"
              placeholder="Capacity"
              value={formData.capacity}
              onChange={handleChange}
            />
            <input
              type="number"
              name="price"
              placeholder="Price (per night)"
              value={formData.price}
              onChange={handleChange}
              required
            />
            <input
              type="number"
              name="floor"
              placeholder="Floor"
              value={formData.floor}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <select name="status" value={formData.status} onChange={handleChange}>
              <option value="available">Available</option>
              <option value="booked">Booked</option>
              <option value="maintenance">Maintenance</option>
              <option value="unavailable">Unavailable</option>
            </select>
            <input
              type="text"
              name="amenities"
              placeholder="Amenities (comma-separated)"
              value={formData.amenities}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn-primary">
            {editId ? '✏️ Update Room' : '➕ Add Room'}
          </button>
          {editId && <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>}
        </form>
      </div>

      <div className="list-section">
        <h2>Rooms Inventory</h2>
        {loading ? (
          <p>Loading...</p>
        ) : rooms.length === 0 ? (
          <p>No rooms found</p>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Room No.</th>
                  <th>Type</th>
                  <th>Bed</th>
                  <th>Capacity</th>
                  <th>Price</th>
                  <th>Floor</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rooms.map(room => (
                  <tr key={room._id}>
                    <td>{room.roomNumber}</td>
                    <td>{room.roomType}</td>
                    <td>{room.bedType}</td>
                    <td>{room.capacity}</td>
                    <td>₹{room.price}</td>
                    <td>{room.floor}</td>
                    <td><span className={`badge ${getStatusBadgeClass(room.status)}`}>{room.status}</span></td>
                    <td>
                      <button onClick={() => handleEdit(room)} className="btn-edit">Edit</button>
                      <button onClick={() => handleDelete(room._id)} className="btn-delete">Delete</button>
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

export default RoomManagement;
