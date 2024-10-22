const mongoose = require('mongoose');


const WeeklyScheetSchema = new mongoose.Schema({
  dayname: {
    type: String,
    required: true,
    enum: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'], // Days of the week
  },
  isopen: {
    type: Boolean,
    default: true
  },
  shifts: [
    {
    maxReservations: Number,
    _id: mongoose.Schema.Types.ObjectId, // Shift ID
    name: String,
    openingTime: String,
    closingTime: String,
    reservationDuration: Number
  }
]
});

const WeeklyScheet = mongoose.model('WeeklyScheet', WeeklyScheetSchema);
module.exports = WeeklyScheet;
