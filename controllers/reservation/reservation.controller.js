const Reservation = require("../../models/reservation.model");
const WeeklyScheet = require('../../models/shift.model');
const moment = require('moment');

const reservationController = {};
// Fonction pour obtenir le jour de la semaine
const getDayOfWeek = (dateString) => {
  const date = new Date(dateString);
  const days = [ 'dimanche','lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi',];
  return days[date.getDay()];
};
//getTime

reservationController.getReservation = async (req, res) => {
  try {
      console.log('Fetching all reservations');
      
      // Récupérer toutes les réservations
      const reservations = await Reservation.find();
      
      console.log('All reservations:', reservations);
      res.status(200).json(reservations);
  } catch (error) {
      console.error('Error fetching reservations:', error);
      res.json({ error: 'Failed to fetch reservations' });
  }
};



reservationController.createReservation = async (req, res) => {
  try {
    const { firstname, lastname, date, time, phone, email, shiftName } = req.body;

    // Obtenir le jour de la semaine à partir de la date
    const selectedDay = getDayOfWeek(date);
    const scheet = await WeeklyScheet.findOne({ dayname: selectedDay });

    // Vérifier si l'horaire existe pour le jour sélectionné
    if (!scheet) {
      return res.json({ message: "No schedule found for the selected day." });
    }

    // Vérifier si le jour est ouvert
    if (!scheet.isopen) {
      return res.json({ message: "Reservations are not allowed on this day." });
    }

    // Chercher le shift par son nom
    const shift = scheet.shifts.find(s => s.name === shiftName);
    if (!shift) {
      return res.status(400).json({ message: "No shift found with the provided name." });

    }

   // Vérifier le nombre de réservations existantes pour ce shift et cette date
   const currentReservations = await Reservation.find({
    date,
    shiftId: shift._id 
  }).countDocuments();

  // Vérifier si le nombre de réservations dépasse `maxReservations`
  if (currentReservations >= shift.maxReservations) {
    return res.status(400).json({
      message: `Cannot create reservation: maximum reservations of ${shift.maxReservations} reached for this shift.`
    });
  }
    // Le reste de votre logique ici
    const reservationDuration = parseInt(shift.reservationDuration); // En minutes
    const requestedTime = moment(time, 'HH:mm');

    // Calculer l'heure de fin de la nouvelle réservation
    const requestedEndTime = requestedTime.clone().add(reservationDuration, 'minutes');

    // Vérifier les conflits de réservation dans l'intervalle
    const conflictingReservations = await Reservation.find({
      date,
      shiftId: shift._id, // Ici, on s'assure de vérifier pour le shift correct
      $or: [
        {
          time: {
            $gte: requestedTime.format('HH:mm'),
            $lt: requestedEndTime.format('HH:mm'),
          }
        },
        {
          time: {
            $lte: requestedTime.format('HH:mm'),
            $gt: moment(requestedTime).subtract(reservationDuration, 'minutes').format('HH:mm')
          }
        }
      ]
    });

    // Refuser la réservation si des conflits existent
    if (conflictingReservations.length > 0) {
      return res.status(400).json({ message: "Cannot create reservation: time slot already booked." });
    }

    // Créer la réservation
    const newReservation = new Reservation({
      firstname,
      lastname,
      date,
      time,
      phone,
      email,
      shiftId: shift._id // Associer l'ID du shift à la réservation
    });

    const reservation = await newReservation.save();
    res.status(201).json({ success: true, data: reservation });
  } catch (err) {
    console.error('Error details:', err);
    res.json({ error: 'Failed to create reservation', details: err.message });
  }
};

// Mettre à jour un restaurant
reservationController.updateReservation = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
  
    try {
      // Find the restaurant by ID and update it
      const reservation = await Reservation.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  
      if (!reservation) {
        return res.json({ message: 'reservation not found' });
      }
  
      // Send the updated restaurant data back to the client
      res.status(200).json(reservation);
    } catch (error) {
      // Handle errors
      res.json({ message: error.message });
    }
};

reservationController.deleteReservation = async (req, res) => {
  const { id } = req.params;
  
  try {
      const result = await Reservation.findByIdAndDelete(id);

      if (!result) {
          return res.json({ message: 'Reservation not found' });
      }

      return res.status(200).json({ message: 'Reservation deleted successfully', id });
  } catch (error) {
      return res.json({ message: 'Error deleting reservation', error: error.message });
  }
};

module.exports = reservationController;
