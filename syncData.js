const mongoose = require('mongoose');
const { google } = require('googleapis');
const fs = require('fs');
const Reservation = require('../models/reservation.model');

// MongoDB connection URI and model
const MONGO_URI = 'mongodb://habiba23:IyanHenshim2002@cluster0-shard-00-01.wec5k.mongodb.net:27017,cluster0-shard-00-02.wec5k.mongodb.net:27017,cluster0-shard-00-00.wec5k.mongodb.net:27017/ecbi?authSource=admin&replicaSet=atlas-oam500-shard-0&retryWrites=true&w=majority&ssl=true';
mongoose.connect(MONGO_URI, {
  
    serverSelectionTimeoutMS: 30000,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

 


// Google Sheets setup
const credentials = JSON.parse(fs.readFileSync('C:\\Users\\lenovo\\Downloads\\test-reservation-443716-dc21fc75a4ed.json'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const spreadsheetId = '15ywL3TINT4vik-d3ajtFXzmQbVGVCi79kJVTY0a2Zq8';  // Replace with your Google Sheet ID

// Function to send data to Google Sheets
async function sendDataToGoogleSheet(data) {
  try {
    // Use the full array of reservations, including headers
    const resource = {
      values: data,
    };

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Sheet1!A1', // Modify based on your Sheet name and range
      valueInputOption: 'RAW',
      resource,
    });

    // console.log('Data successfully sent to Google Sheets:', resource.values);
  } catch (error) {
    console.error('Error sending data to Google Sheets:', error);
  }
}

// Fetch data from MongoDB and send it to Google Sheets
async function fetchAndSendData() {
  try {
    const reservations = await Reservation.find(); // Fetch all reservations
    const headers = ['First Name', 'Last Name', 'Email', 'Phone', 'Date', 'Time', 'People Count', 'Status'];
    const data = [headers, ...reservations.map(r => ([
      r.firstname,
      r.lastname,
      r.email,
      r.phone,
      r.date ? new Date(r.date).toISOString() : 'Invalid Date', // Convert string to Date
      r.time,
      r.peopleCount,
      r.status,
    ]))];
    console.log('reses', data)

    await sendDataToGoogleSheet(data);
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
  } finally {
    mongoose.connection.close();
  }
}


module.exports = { fetchAndSendData };
