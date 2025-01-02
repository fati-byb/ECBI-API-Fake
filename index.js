
require('dotenv').config();

const app = require('./app');
 



module.exports = (req, res) => {
  app(req, res); 
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
