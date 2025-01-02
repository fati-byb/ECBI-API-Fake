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
    required: true // Ensure each PointDeVente is associated with a user
},

  name: {
    type: String,
    required: true,
    trim: true,
    default: ''
  },
 
  state: {
    type: String,
    enum: ['blocked', 'actif'],
    default: 'actif',
    required: true,
  },
  visibility: {
    type: String,
    enum: ['show', 'no show'],
    default: 'show',
    required: true,
  },
}, {
  timestamps: true,
});

const PointDeVente = mongoose.model('PointDeVente', PointDeVenteSchema);

module.exports = PointDeVente;
