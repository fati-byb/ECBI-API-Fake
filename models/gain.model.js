const mongoose = require('mongoose');

const gainSchema = new mongoose.Schema({
  loggedInUser: { type: String, required: true }, // Name or unique identifier of the logged-in user
  user: { type: String, required: true },        // Name or unique identifier of the post owner
  coins: { type: Number, required: true },       // Coins gained
  pointOfSale: { type: String, required: true }, // Name of the point of sale
}, { timestamps: true });

const Gain = mongoose.model('Gain', gainSchema);

module.exports = Gain;
