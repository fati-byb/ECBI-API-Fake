const http = require('http');
const { Server } = require('socket.io');

const httpServer = http.createServer();

// Initialize Socket.IO
const io = new Server(httpServer);

io.on('connection', (socket) => {
  console.log('A client connected:', socket.id);
  
  socket.on('newReservation', (data) => {
    console.log('newReservation:', data);
    io.emit('newReservation', data);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

const PORT = process.env.SOCKET_PORT || 5000;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on http://localhost:${PORT}`);
});
