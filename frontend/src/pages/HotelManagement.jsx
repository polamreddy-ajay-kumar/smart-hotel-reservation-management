import React, { useState, useEffect } from 'react';
import '../styles/pages.css';

const HotelManagement = () => {
  const [hotels, setHotels] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    country: '',
    phone: '',
    email: '',
    rating: 0,
    amenities: ''
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHotels();
  }, []);

  const fetchHotels = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/hotels');
      const data = await response.json();
      setHotels(data.data || []);
    } catch (error) {
      console.log('Using demo data:', error);
      setHotels([
        { _id: '1', name: 'Sunset Grand Hotel', city: 'Hyderabad', rating: 4.8, amenities: ['Wi-Fi', 'Pool', 'Parking'] },
        { _id: '2', name: 'Blue Horizon Resort', city: 'Bengaluru', rating: 4.6, amenities: ['Gym', 'Restaurant', 'Spa'] }
      ]);
    }
    setLoading(false);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const amenitiesArray = formData.amenities.split(',').map(a => a.trim());
      const payload = {
        ...formData,
        amenities: amenitiesArray,
        rating: parseFloat(formData.rating)
      };

      const url = editId
        ? `http://localhost:5000/api/hotels/${editId}`
        : 'http://localhost:5000/api/hotels';
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        fetchHotels();
        setFormData({
          name: '',
          address: '',
          city: '',
          country: '',
          phone: '',
          email: '',
          rating: 0,
          amenities: ''
        });
        setEditId(null);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleEdit = (hotel) => {
    setFormData({
      name: hotel.name,
      address: hotel.address || '',
      city: hotel.city || '',
      country: hotel.country || '',
      phone: hotel.phone || '',
      email: hotel.email || '',
      rating: hotel.rating || 0,
      amenities: (hotel.amenities || []).join(', ')
    });
    setEditId(hotel._id);
  };

  const handleDelete = async (id) => {
    try {
      await fetch(`http://localhost:5000/api/hotels/${id}`, { method: 'DELETE' });
      fetchHotels();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>🏨 Hotel Management</h1>
        <p>Add, edit, or manage hotel details and amenities</p>
      </div>

      <div className="form-section">
        <form onSubmit={handleSubmit} className="hotel-form">
          <div className="form-row">
            <input
              type="text"
              name="name"
              placeholder="Hotel Name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <input
              type="text"
              name="address"
              placeholder="Address"
              value={formData.address}
              onChange={handleChange}
            />
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={formData.country}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <input
              type="number"
              name="rating"
              placeholder="Rating (0-5)"
              min="0"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={handleChange}
            />
            <input
              type="text"
              name="amenities"
              placeholder="Amenities (comma-separated)"
              value={formData.amenities}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn-primary">
            {editId ? '✏️ Update Hotel' : '➕ Add Hotel'}
          </button>
        </form>
      </div>

      <div className="list-section">
        <h2>Hotels List</h2>
        {loading ? (
          <p>Loading...</p>
        ) : hotels.length === 0 ? (
          <p>No hotels found</p>
        ) : (
          <div className="grid-container">
            {hotels.map(hotel => (
              <div key={hotel._id} className="card">
                <div className="card-header">
                  <h3>{hotel.name}</h3>
                  <span className="badge-rating">⭐ {hotel.rating}</span>
                </div>
                <div className="card-body">
                  <p><strong>Location:</strong> {hotel.city}, {hotel.country}</p>
                  <p><strong>Address:</strong> {hotel.address}</p>
                  <p><strong>Contact:</strong> {hotel.email}</p>
                  <p><strong>Phone:</strong> {hotel.phone}</p>
                  {hotel.amenities && hotel.amenities.length > 0 && (
                    <p><strong>Amenities:</strong> {hotel.amenities.join(', ')}</p>
                  )}
                </div>
                <div className="card-footer">
                  <button onClick={() => handleEdit(hotel)} className="btn-edit">Edit</button>
                  <button onClick={() => handleDelete(hotel._id)} className="btn-delete">Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HotelManagement;
