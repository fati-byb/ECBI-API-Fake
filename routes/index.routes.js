const express = require('express');
const router = express.Router();
const axios = require('axios');
const userRoutes = require('./users.routes');
const zoneRoutes= require('./zones.routes')
const pointsDeVentesRoutes = require('./pointsdeventes.routes');
const reservationRoutes = require('./reservation.routes');
const categoryRoutes= require('./categories.routes')
const productRoutes =require('./products.routes')
const passport = require('passport');
const WeeklyScheetRoutes = require('./shift.routes');
// const User = require('../models/user.model');
const tableRoutes= require('./tables.routes')
const optionRoutes = require('./options.routes');
const settingsRoutes=require('./settings.routes')


const User = require('../models/user.model');


router.use('/category', categoryRoutes)

router.use('/pointDeVente', pointsDeVentesRoutes);
router.use('/options', optionRoutes)
router.use('/products', productRoutes)
router.get('/users/:id/activate',require('../controllers/user/user.controller').activateUser);
router.use('/pointDeVente', pointsDeVentesRoutes);
router.use('/users', userRoutes);
router.use('/reservation', reservationRoutes)
router.use('/scheet', WeeklyScheetRoutes)
router.use('/zones',zoneRoutes)
router.use('/tables', tableRoutes)
router.use('/setting',settingsRoutes)
router.use('/category', categoryRoutes)
router.use('/products', productRoutes)


router.get('/editEnable/:id', async (req, res) => {
        try {
            const { id } = req.params;
            
            // Find the user by ID
            const user = await User.findById(id);
            
            // If the user does not exist, return an error response
            if (!user) {
                return res.json({ message: "User does not exist" });
            }
    
            // Update the 'enabled' field
            user.enabled = true;
    
            // Save the updated user to the database
            await user.save();
    
            // Return a success response
            return res.status(200).json({ message: "User enabled successfully", user });
        } catch (error) {
            // Handle any errors that occur
            return res.json({ message: "Server error", error });
        }
    });


const SHEETDB_URL = 'https://sheetdb.io/api/v1/f8xfg28m2kq4n';

router.get('/sheetdata', async (req, res) => {
    try {
        const response = await axios.get(SHEETDB_URL);
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error fetching data from SheetDB:', error.message);
        res.status(500).send({ message: 'Failed to fetch data from SheetDB' });
    }
});

// 

router.post('/auth', require('../controllers/user/auth.controller').login);
router.get('/editEnable/:id', async (req, res) => {
        try {
            const { id } = req.params;
            
            // Find the user by ID
            const user = await User.findById(id);
            
            // If the user does not exist, return an error response
            if (!user) {
                return res.status(404).json({ message: "User does not exist" });
            }
    
            // Update the 'enabled' field
            user.enabled = true;
    
            // Save the updated user to the database
            await user.save();
    
            // Return a success response
            return res.status(200).json({ message: "User enabled successfully", user });
        } catch (error) {
            // Handle any errors that occur
            return res.status(500).json({ message: "Server error", error });
        }
    });
 

router.all('*', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err || !user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.user = user;
        next();
    })(req, res, next);
});

router.get('/users/:id/activate',require('../controllers/user/user.controller').activateUser);
router.use('/pointDeVente', pointsDeVentesRoutes);
// router.use('/category', categoryRoutes)
// router.use('/products', productRoutes)

module.exports = router;



// const { google } = require('googleapis');
// const fs = require('fs');

// // Load the service account key
// const credentials = JSON.parse(fs.readFileSync('path/to/your-service-account-key.json'));

// // Authorize Google Sheets API
// const auth = new google.auth.GoogleAuth({
//     credentials,
//     scopes: ['https://www.googleapis.com/auth/spreadsheets'],
// });

// const sheets = google.sheets({ version: 'v4', auth });

// // Replace with your Google Sheet ID
// const spreadsheetId = 'your-spreadsheet-id';

// // Function to add a reservation to Google Sheets
// async function addReservationToSheet(reservationData) {
//     try {
//         const values = [
//             [
//                 reservationData.name,
//                 reservationData.date,
//                 reservationData.email,
//                 reservationData.phone,
//             ],
//         ];

//         const resource = {
//             values,
//         };

//         await sheets.spreadsheets.values.append({
//             spreadsheetId,
//             range: 'Sheet1!A1:D1', // Adjust range and sheet name as needed
//             valueInputOption: 'RAW',
//             resource,
//         });

//         console.log('Reservation added to Google Sheets');
//     } catch (error) {
//         console.error('Error adding reservation to Google Sheets:', error);
//     }
// }

// // Example usage in your reservation route
// app.post('/api/reservation/create', async (req, res) => {
//     const newReservation = new Reservation(req.body);

//     try {
//         const savedReservation = await newReservation.save();
//         await addReservationToSheet(savedReservation); // Add to Google Sheets
//         res.status(201).json(savedReservation);
//     } catch (err) {
//         res.status(500).json({ message: err.message });
//     }
// });