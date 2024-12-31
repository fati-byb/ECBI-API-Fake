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

    const reservations = res.data;

    // Ensure the date field is correctly parsed as Date
    const sortedReservations = reservations.sort((a, b) => {
      const dateA = new Date(a.createdAt); // Use createdAt for latest
      const dateB = new Date(b.createdAt);

      // Check if any dates are invalid
      if (isNaN(dateA) || isNaN(dateB)) {
        return 0; // If any date is invalid, keep the order intact
      }

      return dateB - dateA; // Sort by most recent createdAt date
    });

    // Get the most recent reservation based on createdAt
    const latestReservation = sortedReservations[0];

    console.log('Latest reservation:', latestReservation);

    const headers = ['Id', 'First Name', 'Last Name', 'Email', 'Phone', 'Date', 'Time', 'People Count', 'Status'];

    // Construct the data array with headers and the latest reservation's values
    const data = [
      headers,
      [
        latestReservation._id,
        latestReservation.firstname,
        latestReservation.lastname,
        latestReservation.email,
        latestReservation.phone,
        latestReservation.date ? new Date(latestReservation.date).toISOString() : 'Invalid Date',
        latestReservation.time,
        latestReservation.peopleCount,
        latestReservation.status,
      ],
    ];

    // Now send this most recent reservation data to Google Sheets
    await sendDataToGoogleSheet(data);

  } catch (error) {
    console.error('Error fetching data from API:', error);
  }
}


module.exports = { fetchAndSendData };
