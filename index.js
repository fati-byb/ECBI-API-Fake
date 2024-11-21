require('dotenv').config();

const app = require('./app');

const server = require('http').createServer(app);

const PORT = process.env.PORT || 4000;
 

server.listen(PORT, () => {
    console.log(`Server is ready for connections on port ${PORT} `);
});

require('dotenv').config();
const app = require('./app');

// Export the app as a handler for Vercel
module.exports = (req, res) => {
  app(req, res); // Pass the request and response to your express app
};
