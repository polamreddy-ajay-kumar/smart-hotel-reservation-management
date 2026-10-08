# Smart Hotel Reservation & Management System with Real-Time Booking

A full-stack hotel reservation and management application with room allocation, customer management, reservations, real-time booking updates, and payment workflow support.

## Tech Stack
- Frontend: React + Vite
- Backend: Node.js + Express
- Database: MongoDB (configurable via Mongoose)
- Real-time updates: Socket.IO
- Styling: CSS

## Features
- Hotel listing and management
- Room inventory and allocation
- Customer and guest profile management
- Reservation CRUD
- Payment processing flow
- Real-time booking updates
- Admin dashboard structure

## Project Structure
```bash
smart-hotel-reservation-management/
├── backend/
│   ├── config/
│   ├── routes/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── frontend/
│   ├── src/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .gitignore
├── package.json
└── README.md
```

## Quick Start

### 1) Install dependencies
```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

### 2) Setup environment
Copy backend `.env.example` to `.env` and update the values.

### 3) Run development servers
```bash
npm run dev
```

This starts both backend and frontend.

## Default URLs
- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## API Endpoints
- GET `/api/hotels`
- GET `/api/rooms`
- GET `/api/reservations`
- GET `/api/customers`
- POST `/api/payments`

## Author
Ajay Kumar Polamreddy
