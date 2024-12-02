const express = require('express');
const Reservation = require("./models/reservation.model");

const http = require('http');
const { Server } = require('socket.io'); // Import Socket.IO
const axios = require('axios'); // Import Axios to send POST requests

// Create an Express app
const app = 
express();
const PORT=4000;

// Middleware to parse JSON body in requests
app.use(express.json());

// Create an HTTP server to handle requests
const server = http.createServer(app);

// Create a new Socket.IO instance
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins (update this in production for security)
    methods: ['GET', 'POST'],
  },
});

 io.on('connection', (socket) => {
  console.log('A new client connected.');

   socket.on('message', (data) => {
    console.log('Message received:', data);

     socket.broadcast.emit('message', data);
  });

  // Custom event for reservations
  socket.on('NEW_RESERVATION', (reservation) => {
    console.log('Received NEW_RESERVATION:', reservation);
});

  // Handle client disconnecting
  socket.on('disconnect', () => {
    console.log('A client disconnected.');
  });

  // Send a welcome message to the newly connected client
  socket.emit('message', { message: 'Welcome to the WebSocket server' });
});



// Start the HTTP server on port 4000
server.listen(PORT, () => {
  console.log('Socket.IO server running on http://localhost:4000');
});
