import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentBookings, setRecentBookings] = useState([]);
  const [occupancy, setOccupancy] = useState([]);
  const [topCustomers, setTopCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (!token) {
      navigate('/login');
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }

    fetchDashboardData(token);
  }, [navigate]);

  const fetchDashboardData = async (token) => {
    try {
      const [statsRes, bookingsRes, occupancyRes, customersRes] = await Promise.all([
        fetch('http://localhost:5000/api/dashboard/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/dashboard/recent-reservations', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/dashboard/occupancy', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/dashboard/top-customers', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const statsData = await statsRes.json();
      const bookingsData = await bookingsRes.json();
      const occupancyData = await occupancyRes.json();
      const customersData = await customersRes.json();

      if (statsData.success) setStats(statsData.data);
      if (bookingsData.success) setRecentBookings(bookingsData.data);
      if (occupancyData.success) setOccupancy(occupancyData.data);
      if (customersData.success) setTopCustomers(customersData.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;

  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div className="header-left">
          <h1>🏨 Hotel Dashboard</h1>
          {user && <p>Welcome, {user.firstName} {user.lastName}</p>}
        </div>
        <button onClick={handleLogout} className="btn-logout">Logout</button>
      </header>

      <div className="dashboard-content">
        {stats && (
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🏨</div>
              <div className="stat-info">
                <p>Hotels</p>
                <h3>{stats.hotels.total}</h3>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🛏️</div>
              <div className="stat-info">
                <p>Rooms</p>
                <h3>{stats.rooms.total}</h3>
                <small>Available: {stats.rooms.available}</small>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📅</div>
              <div className="stat-info">
                <p>Reservations</p>
                <h3>{stats.reservations.total}</h3>
                <small>Confirmed: {stats.reservations.confirmed}</small>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <p>Customers</p>
                <h3>{stats.customers.total}</h3>
              </div>
            </div>
            <div className="stat-card revenue">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <p>Total Revenue</p>
                <h3>₹{stats.revenue.total.toLocaleString()}</h3>
                <small>Pending: ₹{stats.revenue.pending.toLocaleString()}</small>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👨‍💼</div>
              <div className="stat-info">
                <p>Staff</p>
                <h3>{stats.users.total}</h3>
              </div>
            </div>
          </div>
        )}

        <div className="dashboard-row">
          <div className="dashboard-section occupancy-section">
            <h2>🏢 Room Occupancy</h2>
            {occupancy.length > 0 ? (
              <div className="occupancy-list">
                {occupancy.map(hotel => (
                  <div key={hotel.hotelId} className="occupancy-item">
                    <div className="hotel-name">{hotel.hotelName}</div>
                    <div className="occupancy-bar">
                      <div
                        className="occupancy-fill"
                        style={{ width: `${hotel.occupancyRate}%` }}
                      ></div>
                    </div>
                    <div className="occupancy-stats">
                      <span>{hotel.bookedRooms}/{hotel.totalRooms} rooms</span>
                      <span className="occupancy-percent">{hotel.occupancyRate}%</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No occupancy data available</p>
            )}
          </div>

          <div className="dashboard-section customers-section">
            <h2>⭐ Top Customers</h2>
            {topCustomers.length > 0 ? (
              <div className="customers-list">
                {topCustomers.map((customer, index) => (
                  <div key={customer._id} className="customer-item">
                    <div className="rank">#{index + 1}</div>
                    <div className="customer-info">
                      <p className="customer-name">{customer.firstName} {customer.lastName}</p>
                      <p className="customer-email">{customer.email}</p>
                    </div>
                    <div className="customer-spent">
                      <p>₹{customer.totalSpent?.toLocaleString() || '0'}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p>No customer data available</p>
            )}
          </div>
        </div>

        <div className="dashboard-section bookings-section">
          <h2>📅 Recent Reservations</h2>
          {recentBookings.length > 0 ? (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Guest</th>
                    <th>Hotel</th>
                    <th>Check-In</th>
                    <th>Check-Out</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.slice(0, 5).map(booking => (
                    <tr key={booking._id}>
                      <td>{booking.customerId?.firstName || 'N/A'}</td>
                      <td>{booking.hotelId?.name || 'N/A'}</td>
                      <td>{new Date(booking.checkInDate).toLocaleDateString()}</td>
                      <td>{new Date(booking.checkOutDate).toLocaleDateString()}</td>
                      <td><span className={`badge badge-${booking.status}`}>{booking.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p>No recent reservations</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
