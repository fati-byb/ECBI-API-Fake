const serverless = require('serverless-http');
const app = require('../app'); // Import the app

module.exports = serverless(app); // Export the app as a serverless function
