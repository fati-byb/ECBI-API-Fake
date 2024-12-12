const { google } = require('googleapis');
const fs = require('fs');
const axios = require('axios');  // Import axios
const { io } = require('socket.io-client');
// const socket = io('https://2548-160-178-166-35.ngrok-free.app');

// Google Sheets setup
const credentials = JSON.parse(fs.readFileSync('C:\\Users\\lenovo\\Downloads\\my-project-47988-1724857759877-12b3518c2287.json'));

const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const spreadsheetId = '14ZM2nzpoZe00kUejKGmO1ljOGwLtGVmrVw0xkuTPfHk';  // Replace with your Google Sheet ID

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

    console.log('Data successfully sent to Google Sheets:', resource.values);
  } catch (error) {
    console.error('Error sending data to Google Sheets:', error);
  }
}

// Fetch data from API using Axios and send it to Google Sheets
async function fetchAndSendData() {
  try {
    const res = await axios.get("https://ecbi-api-fake-1.vercel.app/api/reservation/get-reservation");
console.log('yewriu', res)
    const reservations = res.data;  

    const headers = ['Id', 'First Name', 'Last Name', 'Email', 'Phone', 'Date', 'Time', 'People Count', 'Status'];

    const data = [headers, ...reservations.map(r => ([
      r._id,
      r.firstname,
      r.lastname,
      r.email,
      r.phone,
      r.date ? new Date(r.date).toISOString() : 'Invalid Date', // Convert string to Date
      r.time,
      r.peopleCount,
      r.status,
    ]))];

    await sendDataToGoogleSheet(data);

    // Optionally manage the WebSocket connection here if necessary
    // socket.on('connect', () => {
    //   console.log('Connected to the Socket.IO server adalo:', socket.id);
    // });

  } catch (error) {
    console.error('Error fetching data from API:', error);
  }
}

module.exports = { fetchAndSendData };
