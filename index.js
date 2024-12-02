require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io'); // Import Socket.IO
const ioClient = require('socket.io-client'); // Import the Socket.IO client to connect to the server

// Initialize your Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware to parse JSON body in requests
app.use(express.json());

// Create an HTTP server to handle requests
const server = http.createServer(app);

// Create a new Socket.IO instance
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// Socket connection to the backend server
const socketBackend = ioClient('http://localhost:5000'); // Connect to the Socket.IO server

socketBackend.on('connect', () => {
  console.log('Backend connected to the Socket.IO server');
  
  // Listen for events from the frontend or server
  socketBackend.on('NEW_RESERVATION', (reservation) => {
    console.log('Received new reservation in the backend:', reservation);
    // Process reservation here (e.g., save it to DB)
  });
});

// API routes
app.post('/api/reservation/add-reservation', (req, res) => {
  const { firstname,lastname,date,time,phone,email,shiftName,peopleCount} = req.body;
console.log('uryewiu', req.body)
  // Here, you would typically save the reservation data to your database.
  // For now, we'll assume the reservation is created successfully and send it back.

  const newReservation = {
    firstname,
    lastname,
    date,
    time,
    phone,
    email,
    shiftName,
    peopleCount
  };

  // Emit the actual reservation data to the Socket.IO server
  socketBackend.emit('NEW_RESERVATION', newReservation);

  // Respond back to the client with the created reservation
  res.json({ success: true, data: newReservation });
});

// Socket event listener for messages
socketBackend.on('message', (data) => {
  console.log('Backend received message:', data);
});

// Start the HTTP server and listen on the specified port
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
