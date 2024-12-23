const Visitor = require('../../models/visiteur.model'); // Adjust the path to your Visitor model

const visiteurController = {};

// Fetch all visitors
visiteurController.getVisitors = async (req, res) => {
  try {
    const visitors = await Visitor.find(); // Fetch all visitors from the collection
    res.json(visitors);
  } catch (error) {
    console.error('Error fetching visitors:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Fetch a specific visitor by email
visiteurController.getVisitorByEmail = async (req, res) => {
  try {
    const { email } = req.params; // Extract email from URL params
    const visitor = await Visitor.findOne({ email }); // Fetch visitor by email

    if (!visitor) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }

    res.json({ success: true, data: visitor });
  } catch (error) {
    console.error('Error fetching visitor:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Create a new visitor
visiteurController.createVisitor = async (req, res) => {
  try {
    const { firstname, lastname, phone, email, numberOfVisits } = req.body;

    // Validate request body
    if (!firstname || !lastname || !phone || !email) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    // Check if the email already exists
    const existingVisitor = await Visitor.findOne({ email });
    if (existingVisitor) {
      return res.status(400).json({ success: false, message: 'Visitor already exists' });
    }

    // Create and save the new visitor
    const newVisitor = new Visitor({
      firstname,
      lastname,
      phone,
      email,
      numberOfVisits: numberOfVisits || 0, // Default to 0 if not provided
    });

    await newVisitor.save();

    res.status(201).json({ success: true, message: 'Visitor created successfully', data: newVisitor });
  } catch (error) {
    console.error('Error creating visitor:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Update a visitor's number of visits
visiteurController.updateVisitorVisits = async (req, res) => {
  try {
    const { email } = req.params;
    const { numberOfVisits } = req.body;

    // Validate numberOfVisits
    if (typeof numberOfVisits !== 'number' || numberOfVisits < 0) {
      return res.status(400).json({ success: false, message: 'Invalid number of visits' });
    }

    // Update the visitor's number of visits
    const updatedVisitor = await Visitor.findOneAndUpdate(
      { email },
      { $set: { numberOfVisits } },
      { new: true } // Return the updated document
    );

    if (!updatedVisitor) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }

    res.json({ success: true, message: 'Visitor updated successfully', data: updatedVisitor });
  } catch (error) {
    console.error('Error updating visitor visits:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Delete a visitor by email
visiteurController.deleteVisitor = async (req, res) => {
  try {
    const { email } = req.params;

    const deletedVisitor = await Visitor.findOneAndDelete({ email });

    if (!deletedVisitor) {
      return res.status(404).json({ success: false, message: 'Visitor not found' });
    }

    res.json({ success: true, message: 'Visitor deleted successfully' });
  } catch (error) {
    console.error('Error deleting visitor:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = visiteurController;
