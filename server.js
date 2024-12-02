const express = require('express');
const Reservation = require("./models/reservation.model");

const http = require('http');
const { Server } = require('socket.io'); // Import Socket.IO
const axios = require('axios'); // Import Axios to send POST requests

// Create an Express app
const app = express();
const PORT=5000;

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

   socket.on('NEW_RESERVATION', (reservation) => {
    console.log('New reservation received:', reservation);

     io.emit('NEW_RESERVATION', reservation);
  });

   socket.on('disconnect', () => {
    console.log('A client disconnected.');
  });

   socket.emit('message', { message: 'Welcome to the WebSocket server' });
});

// app.get('/api/reservation', async (req, res) => {
//     try {
//        const allReservations = await Reservation.find();
  
//        io.emit('ALL_RESERVATIONS', allReservations);
  
//        res.status(200).json(allReservations);
//     } catch (error) {
//       console.error('Error fetching reservations:', error);
//       res.status(500).json({ message: 'Failed to fetch reservations' });
//     }
//   });

// app.post('/api/reservation/add-reservatio', async (req, res) => {
  
//   try {
//     const { name, date, numberOfPeople } = req.body; // Extract the necessary fields from the request body
    
//     // Create a new reservation instance
//     const newReservation = new Reservation({
//       name,
//       date,
//       numberOfPeople,
//     });

//     // Save the reservation to the database
//     await newReservation.save();

//     // Emit the new reservation to all connected clients via Socket.IO
//     io.emit('NEW_RESERVATION', newReservation);

//     // Send a success response
//     res.json(newReservation);
//   } catch (error) {
//     console.error('Error creating reservation:', error);
//     res.json({ message: 'Failed to create reservation' });
//   }
// });

// Start the HTTP server on port 4000
server.listen(PORT, () => {
  console.log('Socket.IO server running on http://localhost:5000');
});
