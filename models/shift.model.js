const mongoose = require('mongoose');

const WeeklyScheetSchema = new mongoose.Schema({
  dayname: {
    type: String,
    required: true,
    enum: ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'], // Limite les valeurs possibles
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
      reservationDuration: {
        type: Number,  // Durée en minutes
        required: true,  // Ex: 60 pour une heure, 30 pour une demi-heure
      },
      maxReservations: {
        type: Number, // Nombre maximum de réservations autorisées
        required: true,  // Ce champ est requis, exemple : 10
        default: 7  // Valeur par défaut si aucune n'est spécifiée
      }
    }
  ]
});

const WeeklyScheet = mongoose.model('WeeklyScheet', WeeklyScheetSchema);

module.exports = WeeklyScheet;

