require('dotenv').config();
const app = require('./app');

// Export the app directly to be used as a serverless function on Vercel
module.exports = app;
