const Visitor = require('../../models/visiteur.model'); // Adjust the path to your Visitor model

const visiteurController = {};

// Fetch all visitors
visiteurController.getVisitors = async (req, res) => {
  const { page = 1, limit = 5} = req.query; // Defaults: page 1, 5 items per page
  const skip = (page - 1) * limit;
  try {
    const totalVisitors = await Visitor.countDocuments();

    const visitors = await Visitor.find()
    .skip(Number(skip))
    .limit(Number(limit));  

    ; // Fetch all visitors from the collection
    res.json({
      data: visitors,
      currentPage: Number(page),
      totalPages: Math.ceil(totalVisitors / limit),
    });
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
// Create or increment visits for a visitor
visiteurController.createVisitor = async (req, res) => {
  try {
    const { firstname, lastname, phone, email } = req.body;

    // Validate request body
    if (!firstname || !lastname || !phone || !email) {
      return res.json({ success: false, message: 'All fields are required' });
    }

    // Check if the email already exists
    const existingVisitor = await Visitor.findOne({ email });

    if (existingVisitor) {
      // Increment the number of visits by 1 if the visitor exists
      existingVisitor.numberOfVisits = (existingVisitor.numberOfVisits || 0) + 1;
      await existingVisitor.save();

      return res.json({
        success: true,
        message: 'Visitor found, incremented number of visits',
        data: existingVisitor,
      });
    }

     const newVisitor = new Visitor({
      firstname,
      lastname,
      phone,
      email,
      numberOfVisits: 1, // Set initial visits to 1
    });

    await newVisitor.save();

    res.json({
      success: true,
      message: 'Visitor created successfully',
      data: newVisitor,
    });
  } catch (error) {
    console.error('Error creating or updating visitor:', error);
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
