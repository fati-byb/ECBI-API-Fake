// api/users.js
module.exports = (req, res) => {
    // Handle your API logic here based on the method (GET, POST, etc.)
    if (req.method === 'GET') {
      res.status(200).json({ message: 'Here are all the users' });
    } else if (req.method === 'POST') {
      // Handle POST request
      res.status(201).json({ message: 'User created' });
    } else {
      res.status(405).json({ message: 'Method Not Allowed' });
    }
  };
  