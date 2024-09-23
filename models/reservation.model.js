const mongoose = require('mongoose');

const ReservationSchema = new mongoose.Schema({
  firstname: {
    type: String,
    required: true,
    trim: true,
    default: ''
  },
  lastname: {
    type: String,
    required: true,
    trim: true,
    default: ''
  },
  date: {
    type: String,
    required: true,
    trim: true,
  },
  time: {
    type: String,
    required: true,
    trim: true,
  },

  phone:{
    type:String, 
    required: false
},
 
  email: {
    type: String,
    lowercase: true,
    unique: true,
    required: [false, "can't be blank"],
    match: [/\S+@\S+\.\S+/, 'is invalid'],
    index: true
},

}, {
  timestamps: true,
});

const Reservation = mongoose.model('reservation', ReservationSchema);

module.exports = Reservation;
