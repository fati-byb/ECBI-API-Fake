const mongoose = require('mongoose');

const RestaurantSchema = new mongoose.Schema({
  
  website: {
    type: String,
    required: true,
    trim: true,
  },
  reservation: {
    type: String,
    required: true,
    trim: true,
  },
  menu: {
    type: String,
    required: true,
    trim: true,
  },
  owner: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
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
