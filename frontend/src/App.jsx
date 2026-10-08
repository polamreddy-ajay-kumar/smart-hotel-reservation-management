import { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const socket = io('http://localhost:5000');

const initialStats = {
  hotels: 0,
  rooms: 0,
  reservations: 0,
  customers: 0
};

function App() {
  const [stats, setStats] = useState(initialStats);
  const [hotels, setHotels] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [lastUpdate, setLastUpdate] = useState('Waiting for updates');

  useEffect(() => {
    fetch('http://localhost:5000/api/hotels')
      .then((res) => res.json())
      .then((data) => {
        setHotels(data);
        setStats((prev) => ({ ...prev, hotels: data.length }));
      });

    fetch('http://localhost:5000/api/rooms')
      .then((res) => res.json())
      .then((data) => setStats((prev) => ({ ...prev, rooms: data.length })));

    fetch('http://localhost:5000/api/reservations')
      .then((res) => res.json())
      .then((data) => {
        setBookings(data);
        setStats((prev) => ({ ...prev, reservations: data.length }));
      });

    fetch('http://localhost:5000/api/customers')
      .then((res) => res.json())
      .then((data) => setStats((prev) => ({ ...prev, customers: data.length })));

    socket.on('booking:updated', (payload) => {
      setLastUpdate(`Updated: ${payload.type || 'reservation'} at ${new Date().toLocaleTimeString()}`);
      if (payload.reservation) {
        setBookings((prev) => [payload.reservation, ...prev]);
      }
    });

    return () => socket.disconnect();
  }, []);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">Smart Hotel</p>
          <h1>Reservation & Management System</h1>
        </div>
        <button className="primary-btn">New Booking</button>
      </header>

      <section className="stats-grid">
        <div className="card">
          <span>Hotels</span>
          <strong>{stats.hotels}</strong>
        </div>
        <div className="card">
          <span>Rooms</span>
          <strong>{stats.rooms}</strong>
        </div>
        <div className="card">
          <span>Reservations</span>
          <strong>{stats.reservations}</strong>
        </div>
        <div className="card">
          <span>Customers</span>
          <strong>{stats.customers}</strong>
        </div>
      </section>

      <section className="panel">
        <div className="panel-header">
          <h2>Hotel Overview</h2>
          <span>{lastUpdate}</span>
        </div>
        <div className="hotel-list">
          {hotels.map((hotel) => (
            <div className="hotel-item" key={hotel.id}>
              <div>
                <h3>{hotel.name}</h3>
                <p>{hotel.city}</p>
              </div>
              <div className="meta">
                <span>⭐ {hotel.rating}</span>
                <span>{hotel.availableRooms} rooms</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Recent Reservations</h2>
        <table>
          <thead>
            <tr>
              <th>Guest</th>
              <th>Room</th>
              <th>Dates</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id}>
                <td>{booking.guestName}</td>
                <td>{booking.roomId}</td>
                <td>{booking.checkIn} → {booking.checkOut}</td>
                <td><span className="badge">{booking.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}

export default App;
