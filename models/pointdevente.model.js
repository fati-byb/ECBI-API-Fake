const mongoose = require('mongoose');

const PointDeVenteSchema = new mongoose.Schema({
  website: {
    type: String,
    required: true,
    trim: true,
  },
  user: {
    type: mongoose.Types.ObjectId,
    ref: "User", // Reference the User collection
    required: false, // Make it optional
  },
  name: {
    type: String,
    required: true,
    trim: true,
    default: '',
  },
  state: {
    type: String,
    enum: ['blocked', 'actif'],
    default: 'actif',
  },
  visibility: {
    type: String,
    enum: ['show', 'no show'],
    default: 'show',
  },
}, {
  timestamps: true,
});


const PointDeVente = mongoose.model('PointDeVente', PointDeVenteSchema);

module.exports = PointDeVente;
