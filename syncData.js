// const { google } = require('googleapis');
// const fs = require('fs');
// const axios = require('axios');  // Import axios
// const { io } = require('socket.io-client');
// // const socket = io('https://2548-160-178-166-35.ngrok-free.app');
// const path = require('path');

// // Google Sheets setup
// const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.resolve(__dirname, 'my-project-47988-1724857759877-0d43931ddf4e.json');
// const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
// console.log('Computed credentials path:', credentialsPath);


// const auth = new google.auth.GoogleAuth({
//   credentials,
//   scopes: ['https://www.googleapis.com/auth/spreadsheets'],
// });

// const sheets = google.sheets({ version: 'v4', auth });

// const spreadsheetId = '14ZM2nzpoZe00kUejKGmO1ljOGwLtGVmrVw0xkuTPfHk';  // Replace with your Google Sheet ID

//  async function sendDataToGoogleSheet(data) {
//   try {
//      const resource = {
//       values: data,
//     };

//     await sheets.spreadsheets.values.update({
//       spreadsheetId,
//       range: 'Sheet1!A1', 
//       valueInputOption: 'RAW',
//       resource,
//     });

//     // console.log('Data successfully sent to Google Sheets:', resource.values);
//   } catch (error) {
//     console.error('Error sending data to Google Sheets:', error);
//   }
// }

// async function fetchAndSendData() {
//   try {
//     const res = await axios.get("https://ecbi-api-fake-1.vercel.app/api/reservation/get-reservation?page=1&limit=390");

//     const reservations = res.data.data;
//     console.log('Reservations fetched:', reservations);

//     // Define headers for the Google Sheet
//     const headers = ['Id', 'Firstname', 'Lastname', 'Email', 'Phone', 'Date', 'People Count','Point de vente', 'Status'];

//     // Map reservations to rows
//     const rows = reservations.map(reservation => [
//       reservation._id,
//       reservation.firstname,
//       reservation.lastname,
//       reservation.email,
//       reservation.phone,
//       reservation.date,// Format date
//       // reservation.time,
//       reservation.peopleCount,
//       reservation.pointDeVente.name,
//       reservation.status,
//     ]);

//     // Combine headers and rows
//     const data = [headers, ...rows];
//     console.log('Formatted data for Google Sheets:', data);

//     // Send the data to Google Sheets
//     await sendDataToGoogleSheet(data);

//     console.log('Data successfully sent to Google Sheets.');
//   } catch (error) {
//     console.error('Error fetching or sending data:', error);
//   }
// }


// module.exports = { fetchAndSendData };
