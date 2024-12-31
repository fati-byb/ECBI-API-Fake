const mongoose = require('mongoose');

// Visitor schema
const visitorSchema = new mongoose.Schema({
  firstname: { type: String, required: true },   // First name of the visitor
  lastname: { type: String, required: true },    // Last name of the visitor
  phone: { type: String, required: true },       // Phone number of the visitor
  email: { type: String, required: true},  // Email of the visitor
  numberOfVisits: { type: Number, default: 0 },  // Number of visits by the visitor
}, { timestamps: true });

const Visitor = mongoose.model('Visitor', visitorSchema);

module.exports = Visitor;
