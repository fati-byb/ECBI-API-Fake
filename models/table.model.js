 const mongoose = require('mongoose');

 const tableSchema = new mongoose.Schema({
  nom: {
    type: String,
    required: true,
    trim: true,  // Remove any trailing spaces
  },
  places: {
    type: Number,
    required: true,
    min: 1,  // Minimum value should be 1 to ensure valid input
  },
  status:{
     type: String,
  required: true,
  enum: ["booked","available"],
  default:"available"
  // Days of the week
  }
 ,

  min: {
    type: Number,
    required: true,
    min: 1,  // Minimum value should be 1 for valid reservations
  },
  zone: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Zone',  // Reference the Zone model
    required: true,  // Ensure zone is selected
  }
}, {
  timestamps: true,  // Adds createdAt and updatedAt fields
});

const Table = mongoose.model('Table', tableSchema);

module.exports = Table;
