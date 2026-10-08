module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Client connected:', socket.id);

    // Real-time availability updates
    socket.on('room:availability-update', (data) => {
      io.emit('room:updated', data);
    });

    // Real-time booking notifications
    socket.on('booking:created', (data) => {
      io.emit('booking:new-reservation', data);
    });

    socket.on('booking:cancelled', (data) => {
      io.emit('booking:reservation-cancelled', data);
    });

    // Price updates
    socket.on('price:update', (data) => {
      io.emit('price:updated', data);
    });

    // Live availability changes
    socket.on('availability:change', (data) => {
      io.emit('availability:changed', data);
    });

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });
};
