// const { google } = require('googleapis');
// const axios = require('axios'); // Pour appeler l'API du backend


// const writeToGoogleSheets = async () => {
//   try {
//     // Récupération des données depuis le backend
//     const response = await axios.get('https://ecbi-api-fake-1-dusky.vercel.app/api/reservation/get-reservation'); // Remplacez par votre URL
//     const reservations = response.data;

//     // Configuration de l'authentification Google Sheets
//     const auth = new google.auth.GoogleAuth({
//       keyFile: './config/credentials.json', // Chemin vers le fichier JSON
//       scopes: ['https://www.googleapis.com/auth/spreadsheets']
//     });

//     const client = await auth.getClient();
//     const sheets = google.sheets({ version: 'v4', auth: client });

//     // ID de votre feuille Google Sheets
//     const spreadsheetId = '1S2X3EHRe27ABUL2gDSdS4QsJTbI_HNxDLzYMv6MuJ-4'; // Remplacez par l'ID de votre feuille

//     // Préparer les données pour Google Sheets
//     const rows = reservations.map(reservation => [
//       reservation.firstname,
//       reservation.lastname,
//       reservation.email,
//       reservation.phone,
//       reservation.date,
//       reservation.time
//     ]);

//     // Écriture des données dans Google Sheets
//     await sheets.spreadsheets.values.append({
//       spreadsheetId,
//       range: 'Sheet1!A1', // Commence à la cellule A1
//       valueInputOption: 'RAW',
//       resource: {
//         values: [
//           ['Prénom', 'Nom', 'Email', 'Téléphone', 'Date', 'Heure'], // En-têtes
//           ...rows
//         ]
//       }
//     });

//     console.log('Les réservations ont été exportées avec succès vers Google Sheets.');
//   } catch (error) {
//     console.error('Erreur lors de l\'exportation vers Google Sheets :', error.message);
//   }
// };

// module.exports = { writeToGoogleSheets };




// const mongoose = require('mongoose');
// const { google } = require('googleapis');
// const fs = require('fs');
// const Reservation = require("../../models/reservation.model");
// // MongoDB connection URI and model
// const MONGO_URI ='mongodb://habiba23:IyanHenshim2002@cluster0-shard-00-01.wec5k.mongodb.net:27017,cluster0-shard-00-02.wec5k.mongodb.net:27017,cluster0-shard-00-00.wec5k.mongodb.net:27017/ecbi?authSource=admin&replicaSet=atlas-oam500-shard-0&retryWrites=true&w=majority&ssl=true';
// mongoose.connect(MONGO_URI, {
  
//     serverSelectionTimeoutMS: 30000,
// });

// const db = mongoose.connection;
// db.on('error', console.error.bind(console, 'Connection error:'));
// db.once('open', () => {
//   console.log('Connected to MongoDB');
// });

// // Google Sheets setup

// const credentials = JSON.parse(fs.readFileSync('C:\\Users\\elitbook\\Downloads\\stalwart-fx-443716-s8-f323e44e378d.json'));

// const auth = new google.auth.GoogleAuth({
//   credentials,
//   scopes: ['https://www.googleapis.com/auth/spreadsheets'],
// });

// const sheets = google.sheets({ version: 'v4', auth });

// const spreadsheetId = '1fBIXZjBlzqJv2DZqF31m2xE3CfbmIPwUTft3j6d0Vv0';  // Replace with your Google Sheet ID

// // Function to send data to Google Sheets
// async function sendDataToGoogleSheet(data) {
//   try {
//     // Use the full array of reservations, including headers
//     const resource = {
//       values: data,
//     };

//     await sheets.spreadsheets.values.update({
//       spreadsheetId,
//       range: 'Sheet1!A1', // Modify based on your Sheet name and range
//       valueInputOption: 'RAW',
//       resource,
//     });

//     console.log('Data successfully sent to Google Sheets:', resource.values);
//   } catch (error) {
//     console.error('Error sending data to Google Sheets:', error);
//   }
// }

// // Fetch data from MongoDB and send it to Google Sheets
// async function fetchAndSendData() {
//   try {
//     const reservations = await Reservation.find(); // Fetch all reservations
//     const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Date', 'Time', 'People Count', 'Status'];
//     const data = [headers, ...reservations.map(r => ([
//       r.firstname,
//       r.lastname,
//       r.email,
//       r.phone,
//       r.date ? new Date(r.date).toISOString() : 'Invalid Date', // Convert string to Date
//       r.time,
//       r.peopleCount,
//       r.status,
//     ]))];
 
//     await sendDataToGoogleSheet(data);
//   } catch (error) {
//     console.error('Error fetching data from MongoDB:', error);
//   } finally {
//     mongoose.connection.close();
//   }
// }


// module.exports = { fetchAndSendData };