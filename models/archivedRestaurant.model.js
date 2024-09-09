const mongoose = require('mongoose');

const ArchivedRestaurantSchema = new mongoose.Schema({
  
  website: {
    type: String,
    required: true,
    trim: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
    default:'resto duh'
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
  state: {
    type: String,
    enum: ['blocked', 'actif'],
    default: 'blocked',
    required: true,
  },
  visibility: {
    type: String,
    enum: ['show', 'no show'],
    default: 'no show',
    required: true,
  },
}, {
  timestamps: true, 
});

const ArchivedRestaurant = mongoose.model('ArchivedRestaurant', ArchivedRestaurantSchema);

module.exports = ArchivedRestaurant;
