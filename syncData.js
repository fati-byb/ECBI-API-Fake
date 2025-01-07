const { google } = require('googleapis');
const fs = require('fs');
const axios = require('axios');  // Import axios
const { io } = require('socket.io-client');
// const socket = io('https://2548-160-178-166-35.ngrok-free.app');
const path = require('path');

// Google Sheets setup
const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS || path.resolve(__dirname, 'my-project-47988-1724857759877-0d43931ddf4e.json');
const credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf8'));
console.log('Computed credentials path:', credentialsPath);


const auth = new google.auth.GoogleAuth({
  credentials,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const spreadsheetId = '14ZM2nzpoZe00kUejKGmO1ljOGwLtGVmrVw0xkuTPfHk';  // Replace with your Google Sheet ID

 async function sendDataToGoogleSheet(data) {
  try {
     const resource = {
      values: data,
    };

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Sheet1!A1', 
      valueInputOption: 'RAW',
      resource,
    });

    // console.log('Data successfully sent to Google Sheets:', resource.values);
  } catch (error) {
    console.error('Error sending data to Google Sheets:', error);
  }
}

 async function fetchAndSendData() {
  try {
    const res = await axios.get("https://ecbi-api-fake-1.vercel.app/api/reservation/get-reservation");

    const reservations = res.data;
// console.log('res', reservations)
     const sortedReservations = reservations.data.sort((a, b) => {
      const dateA = new Date(a.createdAt);  
      const dateB = new Date(b.createdAt);
// console.log('a',dateA)
// console.log('b',dateB)
       if (isNaN(dateA) || isNaN(dateB)) {
        return 0;  
      }

      return dateB - dateA;  
    });

     const latestReservation = sortedReservations[0];

    console.log('Latest reservation:', latestReservation);

    const headers = ['Id','Firstname','Lastname', 'Email', 'Phone', 'Date', 'Time', 'People Count', 'Status'];

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

     await sendDataToGoogleSheet(data);

  } catch (error) {
    console.error('Error fetching data from API:', error);
  }
}


module.exports = { fetchAndSendData };
