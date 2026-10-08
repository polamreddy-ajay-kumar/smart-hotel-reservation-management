import React, { useState, useEffect } from 'react';
import '../styles/pages.css';

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    country: '',
    dateOfBirth: '',
    idType: 'Passport',
    idNumber: ''
  });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/customers');
      const data = await response.json();
      setCustomers(data.data || []);
    } catch (error) {
      setCustomers([
        { _id: '1', firstName: 'Rajesh', lastName: 'Kumar', email: 'rajesh@example.com', phone: '9876543210' },
        { _id: '2', firstName: 'Ananya', lastName: 'Singh', email: 'ananya@example.com', phone: '9123456780' }
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
      const url = editId
        ? `http://localhost:5000/api/customers/${editId}`
        : 'http://localhost:5000/api/customers';
      const method = editId ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        fetchCustomers();
        resetForm();
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      country: '',
      dateOfBirth: '',
      idType: 'Passport',
      idNumber: ''
    });
    setEditId(null);
  };

  const handleEdit = (customer) => {
    setFormData({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      address: customer.address || '',
      city: customer.city || '',
      country: customer.country || '',
      dateOfBirth: customer.dateOfBirth || '',
      idType: customer.idType || 'Passport',
      idNumber: customer.idNumber || ''
    });
    setEditId(customer._id);
    setSelectedCustomer(null);
  };

  const enrollLoyalty = async (customerId) => {
    try {
      await fetch(`http://localhost:5000/api/customers/${customerId}/loyalty/enroll`, {
        method: 'POST'
      });
      fetchCustomers();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>👥 Customer Management</h1>
        <p>Manage guest profiles, preferences, and loyalty programs</p>
      </div>

      <div className="form-section">
        <form onSubmit={handleSubmit} className="customer-form">
          <div className="form-row">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-row">
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              type="tel"
              name="phone"
              placeholder="Phone"
              value={formData.phone}
              onChange={handleChange}
              required
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
              name="city"
              placeholder="City"
              value={formData.city}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <input
              type="text"
              name="country"
              placeholder="Country"
              value={formData.country}
              onChange={handleChange}
            />
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleChange}
            />
          </div>
          <div className="form-row">
            <select name="idType" value={formData.idType} onChange={handleChange}>
              <option>Passport</option>
              <option>Driving License</option>
              <option>Aadhar</option>
              <option>ID Card</option>
            </select>
            <input
              type="text"
              name="idNumber"
              placeholder="ID Number"
              value={formData.idNumber}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="btn-primary">
            {editId ? '✏️ Update Customer' : '➕ Add Customer'}
          </button>
          {editId && <button type="button" onClick={resetForm} className="btn-secondary">Cancel</button>}
        </form>
      </div>

      <div className="list-section">
        <h2>Customers List</h2>
        {loading ? (
          <p>Loading...</p>
        ) : customers.length === 0 ? (
          <p>No customers found</p>
        ) : (
          <div className="grid-container">
            {customers.map(customer => (
              <div key={customer._id} className="card" onClick={() => setSelectedCustomer(customer)}>
                <div className="card-header">
                  <h3>{customer.firstName} {customer.lastName}</h3>
                  {customer.loyaltyProgram?.enrolled && (
                    <span className="badge-loyalty">⭐ VIP</span>
                  )}
                </div>
                <div className="card-body">
                  <p><strong>Email:</strong> {customer.email}</p>
                  <p><strong>Phone:</strong> {customer.phone}</p>
                  <p><strong>City:</strong> {customer.city || 'N/A'}</p>
                  {customer.loyaltyProgram?.enrolled && (
                    <>
                      <p><strong>Points:</strong> {customer.loyaltyProgram.points || 0}</p>
                      <p><strong>Tier:</strong> {customer.loyaltyProgram.tier}</p>
                    </>
                  )}
                </div>
                <div className="card-footer">
                  <button onClick={() => handleEdit(customer)} className="btn-edit">Edit</button>
                  {!customer.loyaltyProgram?.enrolled && (
                    <button onClick={() => enrollLoyalty(customer._id)} className="btn-secondary">Join Loyalty</button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerManagement;
