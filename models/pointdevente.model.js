const mongoose = require('mongoose');

const PointDeVenteSchema = new mongoose.Schema({

  website: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    default: 'resto duh'
  },
  directeur: [
    {
      username: {
        type: String,
        required: true,
        trim: true,
        default: 'directeur'
      },
      telephone: {
        type: String,
        required: false,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
      },
    }
  ],

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
