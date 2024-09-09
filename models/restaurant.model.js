const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  
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

const Restaurant = mongoose.model('Restaurant', RestaurantSchema);

module.exports = Restaurant;
