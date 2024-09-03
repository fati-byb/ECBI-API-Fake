require('dotenv').config();

const app = require('./app');

const server = require('http').createServer(app);

const PORT = process.env.PORT || 4000;
 

server.listen(PORT, () => {
    console.log(`Server is ready for connections on port ${PORT} `);
});