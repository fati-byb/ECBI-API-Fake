
require('dotenv').config();

const app = require('./app');
const http = require('http');
const { Server } = require('socket.io'); // Import Socket.IO
const ioClient = require('socket.io-client');
 
app.get('/api/category/get-categories', (req, res) => {
  res.json({ categories: categories });
});

app.get('/api/products/get-products', (req, res) => {
  res.json();
});

const socketBackend = ioClient('http://localhost:4000'); // Connect to the Socket.IO server

socketBackend.on('connect', () => {
  console.log('Backend connected to the Socket.IO server');
  
  socketBackend.on('NEW_RESERVATION', (reservation) => {
    console.log('Received new reservation in the backend:', reservation);
    // Process reservation here (e.g., save it to DB)
  });
});
socketBackend.on('message', (data) => {
  console.log('Backend received message:', data);
});

// Emit events from the backend to the Socket.IO server
socketBackend.emit('NEW_RESERVATION', { name: 'John Doe', date: '2024-12-02', numberOfPeople: 4 });

// Export the app as a handler for Vercel
module.exports = (req, res) => {
  // res.status(200).json({ message: res});
  app(req, res); // Pass the request and response to your express app
};



















// const express = require('express');
// const http = require('http');
// const socketIo = require('socket.io');

// const app = express();
// const server = http.createServer(app);
// const io = socketIo(server, {
    
// });

// io.on('connection', (socket) => {
//     console.log('A user connected');
//     socket.on('disconnect', () => {
//         console.log('User disconnected');
//     });
//     socket.on('newreservation', (data) => {
//       io.emit('sendReservation: data.id')
//   });
// });

// server.listen(4000, () => {
//     console.log('Server running on http://localhost:4000');
// });
