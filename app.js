const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const logger = require('morgan');
const passport = require('passport');
const cors = require('cors');
 const path = require('path');
 const { io } = require('socket.io-client');
 const { fetchAndSendData } = require('./syncData');
 const socket = io('https://5fad-41-141-98-52.ngrok-free.app');
 // in order to create a google scheet


 socket.on('connect', () => {
    console.log('Connected to the Socket.IO server:', socket.id);
  });
  
  socket.on('newReservation', (data) => {
    console.log('New reservation broadcasted:', data);
  });
  
   function emitNewReservation(reservationData) {
    socket.emit('newReservation', reservationData);
    
}

module.exports = { emitNewReservation };


const apiRouter = require('./routes/index.routes');
require('./config/passport')(passport);
const app = express();
// require('../config/socketServer'); 
let isProduction = process.env.NODE_ENV === "production";
app.use('/media/images', express.static(path.join('./media/images')));

 //-------------- DB Config --------------//
mongoose.connect(process.env.MONGODB_URI, {
    // serverSelectionTimeoutMS: 50000,
    // useNewUrlParser: true,
    //  useUnifiedTopology: true

});

mongoose.connection.on('connected', () => {
    console.log('database connected successfully');
    // setInterval(() => {
    //     fetchAndSendData();
    //   }, 5000);
});
mongoose.connection.on('error', (err) => {
    console.error(`Failed to connect to the database: ${err}`);
});

if (!isProduction) {
    mongoose.set('debug', true);
}

//-------------- Middlewares --------------//
app.use(logger('dev'));
 
const whitelist = process.env.CORS_ALLOW || "*";
const corsOptions = {
    origin: function (origin, callback) {
        if (whitelist.indexOf(origin) !== -1 || whitelist.indexOf("*") !== -1) {
            callback(null, true);
        } else {
            const err = new Error('Access Denied');
            err.status = 403;
            callback(err);
        }
    }
}

app.use(cors(corsOptions));

app.use(bodyParser.json({ limit: '20mb' }));
app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

app.use(passport.initialize());






//-------------- Routes --------------//
app.use('/api', apiRouter);
app.use((req, res, next) => {
    req.io = io; // Attach the Socket.IO instance to the request object
    next();
  });
  
//-------------- ERRORS --------------//
app.use((req, res, next) => {
    let err = new Error('Not Found');
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Error processing your request';
    res.status(status).send({ message });
});
app.get('/', (req, res) => {
    res.send('Hello from Vercel!');
  });


//   let server;
// const PORT = 4000;
//       server = http.createServer(app);
  
//       // Initialize WebSocket server
//       const io = new Server(server, {
//           cors: {
//               origin: '*',
//               methods: ['GET', 'POST'],
//           },
//       });
  
//       io.on('connection', (socket) => {
//           console.log('A client connected');
  
//           // Example: Listen for a custom event from the client
//           socket.on('message', (data) => {
//               console.log('Received message:', data);
//               socket.emit('response', { message: 'Message received' });
//           });
  
//           socket.on('disconnect', () => {
//               console.log('A client disconnected');
//           });
//       });
  
//       // Start listening
//       server.listen(PORT, () => {
//           console.log(`Server running on http://localhost:${PORT}`);
//       });


// const express = require('express');
// const mongoose = require('mongoose');
// const bodyParser = require('body-parser');
// const logger = require('morgan');
// const passport = require('passport');
// const cors = require('cors');
// const path = require('path');
// const apiRouter = require('./routes/index.routes');
// require('./config/passport')(passport);

// const app = express();

// let isProduction = process.env.NODE_ENV === "production";
// app.use('/media/images', express.static(path.join('./media/images')));

// //-------------- DB Config --------------//
// mongoose.connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useCreateIndex: true,
//     useUnifiedTopology: true 
// }).then(() => {
//     console.log('Database connected successfully');
// }).catch((err) => {
//     console.error('Failed to connect to the database:', err);
//     process.exit(1);  // Terminer si la connexion échoue
// });

// if (!isProduction) {
//     mongoose.set('debug', true);
// }

// //-------------- Middlewares --------------//
// app.use(logger('dev'));

// const whitelist = process.env.CORS_ALLOW || "*";
// const corsOptions = {
//     origin: function (origin, callback) {
//         if (whitelist.indexOf(origin) !== -1 || whitelist.indexOf("*") !== -1) {
//             callback(null, true);
//         } else {
//             const err = new Error('Access Denied');
//             err.status = 403;
//             callback(err);
//         }
//     }
// };

// app.use(cors(corsOptions));

// app.use(bodyParser.json({ limit: '20mb' }));
// app.use(bodyParser.urlencoded({ limit: '20mb', extended: true }));

// app.use(passport.initialize());

// //-------------- Routes --------------//
// app.use('/api', apiRouter);

// //-------------- ERRORS --------------//
// app.use((req, res, next) => {
//     let err = new Error('Not Found');
//     err.status = 404;
//     next(err);
// });

// app.use((err, req, res, next) => {
//     const status = err.status || 500;
//     const message = err.message || 'Error processing your request';

//     console.error(`Error: ${message} (Status: ${status})`);  // Logs d'erreurs pour le débogage
//     res.status(status).send({ message });
// });

// module.exports = app;

module.exports = app;
