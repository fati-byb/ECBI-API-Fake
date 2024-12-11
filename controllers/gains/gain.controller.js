const Gain = require('../../models/gain.model'); // Adjust path to your Gain model

const gainController = {};

// Fetch all gains
gainController.getGains = async (req, res) => {
  try {
    const gains = await Gain.find(); // Fetch all documents in the collection
    res.json({ success: true, data: gains });
  } catch (error) {
    console.error('Error fetching gains:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create a new gain
gainController.createGain = async (req, res) => {
  try {
    const { loggedInUser, user, coins, pointOfSale } = req.body;

    // Validate request body
    if (!loggedInUser || !user || !coins || !pointOfSale) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Create and save the new gain
    const newGain = new Gain({
      loggedInUser,
      user,
      coins,
      pointOfSale,
    });

    await newGain.save();

    res.status(201).json({ success: true, message: 'Gain created successfully', data: newGain });
  } catch (error) {
    console.error('Error creating gain:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = gainController;
