const mongoose = require('mongoose');


const WeeklyScheetSchema = new mongoose.Schema({
  dayname: {
    type: String,
    required: true,
    enum: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'], 
  },
  isopen: {
    type: Boolean,
    default: true
  },
  shifts: [
    {
       name: {
          type: String,
          required: true
        },
      openingTime: {
        type: String,
        required: true
      },
      closingTime: {
        type: String,
        required: true
      },
      reservationInterval: {
        type: Number,  // En minutes : 30 pour 30 minutes, 60 pour 1 heure, etc.
        required: true
      },
      maxPeoplePerInterval: {
        type: Number,  // Nombre max de personnes autorisées par intervalle de réservation
        required: true,
      }
    }
  ]
});


const WeeklyScheet = mongoose.model('WeeklyScheet', WeeklyScheetSchema);
module.exports = WeeklyScheet;