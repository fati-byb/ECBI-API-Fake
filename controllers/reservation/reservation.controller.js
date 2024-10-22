const Reservation = require("../../models/reservation.model");
const WeeklyScheet = require('../../models/shift.model');
const moment = require('moment');
const Shift= require('../../models/shift.model')
const reservationController = {};

// Function to get the day of the week
const getDayOfWeek = (dateString) => {
  const date = new Date(dateString);
  const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  return days[date.getDay()];
};

reservationController.getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().populate("table");

    // Populate shift details from WeeklyScheet
    const populatedReservations = await Promise.all(reservations.map(async reservation => {
      const scheet = await WeeklyScheet.findOne({ "shifts._id": reservation.shiftId });
      const shift = scheet.shifts.id(reservation.shiftId); // Get the shift details

      return {
        ...reservation.toObject(),
        shift: shift ? {
        _id:shift._id,
          name: shift.name,
          openingTime: shift.openingTime,
          closingTime: shift.closingTime
        } : null
      };
    }));

    res.json(populatedReservations);
  } catch (err) {
    res.json({ error: 'Failed to fetch reservations', details: err.message });
  }
};



// reservationController.createReservation = async (req, res) => {
//   try {
//     const { firstname, lastname, date, time, phone, email, shiftName } = req.body;

//     // Obtenir le jour de la semaine à partir de la date
//     const selectedDay = getDayOfWeek(date);
//     const scheet = await WeeklyScheet.findOne({ dayname: selectedDay });

//     // Vérifier si l'horaire existe pour le jour sélectionné
//     if (!scheet) {
//       return res.json({ message: "No schedule found for the selected day." });
//     }

//     // Vérifier si le jour est ouvert
//     if (!scheet.isopen) {
//       return res.json({ message: "Reservations are not allowed on this day." });
//     }

//     // Chercher le shift par son nom
//     const shift = scheet.shifts.find(s => s.name === shiftName);
//     if (!shift) {
//       return res.status(400).json({ message: "No shift found with the provided name." });

//     }

//    // Vérifier le nombre de réservations existantes pour ce shift et cette date
//    const currentReservations = await Reservation.find({
//     date,
//     shiftId: shift._id 
//   }).countDocuments();

//   // Vérifier si le nombre de réservations dépasse `maxReservations`
//   if (currentReservations >= shift.maxReservations) {
//     return res.status(400).json({
//       message: `Cannot create reservation: maximum reservations of ${shift.maxReservations} reached for this shift.`
//     });
//   }
//     // Le reste de votre logique ici
//     const reservationDuration = parseInt(shift.reservationDuration); // En minutes
//     const requestedTime = moment(time, 'HH:mm');

//     // Calculer l'heure de fin de la nouvelle réservation
//     const requestedEndTime = requestedTime.clone().add(reservationDuration, 'minutes');

//     // Vérifier les conflits de réservation dans l'intervalle
//     const conflictingReservations = await Reservation.find({
//       date,
//       shiftId: shift._id, // Ici, on s'assure de vérifier pour le shift correct
//       $or: [
//         {
//           time: {
//             $gte: requestedTime.format('HH:mm'),
//             $lt: requestedEndTime.format('HH:mm'),
//           }
//         },
//         {
//           time: {
//             $lte: requestedTime.format('HH:mm'),
//             $gt: moment(requestedTime).subtract(reservationDuration, 'minutes').format('HH:mm')
//           }
//         }
//       ]
//     });

//     // Refuser la réservation si des conflits existent
//     if (conflictingReservations.length > 0) {
//       return res.status(400).json({ message: "Cannot create reservation: time slot already booked." });
//     }

//     // Créer la réservation
//     const newReservation = new Reservation({
//       firstname,
//       lastname,
//       date,
//       time,
//       phone,
//       email,
//       shiftId: shift._id // Associer l'ID du shift à la réservation
//     });

//     const reservation = await newReservation.save();
//     res.status(201).json({ success: true, data: reservation });
//   } catch (err) {
//     console.error('Error details:', err);
//     res.json({ error: 'Failed to create reservation', details: err.message });
//   }
// };






// reservationController.createReservation = async (req, res) => {
//   try {
//     const { firstname, lastname, date, time, phone, email, shiftName, peopleCount } = req.body;

//     // Obtenir le jour de la semaine à partir de la date
//     const selectedDay = getDayOfWeek(date);
//     const scheet = await WeeklyScheet.findOne({ dayname: selectedDay });

//     // Vérifier si l'horaire existe pour le jour sélectionné
//     if (!scheet) {
//       return res.json({ message: "No schedule found for the selected day." });
//     }

//     // Vérifier si le jour est ouvert
//     if (!scheet.isopen) {
//       return res.json({ message: "Reservations are not allowed on this day." });
//     }

//     // Chercher le shift par son nom
//     const shift = scheet.shifts.find(s => s.name === shiftName);
//     if (!shift) {
//       return res.status(400).json({ message: "No shift found with the provided name." });
//     }

//     // Calculer l'heure de fin de l'intervalle de réservation
//     const reservationInterval = parseInt(shift.reservationInterval); // En minutes
//     const requestedTime = moment(time, 'HH:mm');
//     const intervalEndTime = requestedTime.clone().add(reservationInterval, 'minutes');

//     // Vérifier le nombre total de personnes déjà réservées pour cet intervalle et ce shift
//     const existingReservations = await Reservation.find({
//       date,
//       shiftId: shift._id,
//       time: {
//         $gte: requestedTime.format('HH:mm'),
//         $lt: intervalEndTime.format('HH:mm'),
//       }
//     });

//     // Calculer le nombre total de personnes dans les réservations existantes
//     const totalPeopleReserved = existingReservations.reduce((total, reservation) => total + reservation.peopleCount, 0);

//     // Vérifier si le nombre maximum de personnes pour cet intervalle est dépassé
//     if (totalPeopleReserved + peopleCount > shift.maxPeoplePerInterval) {
//       return res.status(400).json({
//         message: `Cannot create reservation: maximum people of ${shift.maxPeoplePerInterval} reached for this interval.`
//       });
//     }

//     // Créer la réservation
//     const newReservation = new Reservation({
//       firstname,
//       lastname,
//       date,
//       time,
//       phone,
//       email,
//       shiftId: shift._id, // Associer l'ID du shift à la réservation
//       peopleCount // Stocker le nombre de personnes dans la réservation
//     });

//     const reservation = await newReservation.save();
//     res.status(201).json({ success: true, data: reservation });
  
//   } catch (err) {
//     console.error('Error details:', err);
//     res.json({ error: 'Failed to create reservation', details: err.message });
//   }
// };








reservationController.createReservation = async (req, res) => {
  try {
    const { firstname, lastname, date, time, phone, email, shiftName, peopleCount } = req.body;

    const selectedDay = getDayOfWeek(date);

    // Find the WeeklyScheet with the corresponding day and populate the shifts array
    const scheet = await WeeklyScheet.findOne({ dayname: selectedDay });
    console.log('scheet', scheet)
    if (!scheet) {
      return res.status(404).json({ message: "No schedule found for the selected day." });
    }

    if (!scheet.isopen) {
      return res.status(400).json({ message: "Reservations are not allowed on this day." });
    }

    // Find the correct shift inside the WeeklyScheet shifts array
    const shift = scheet.shifts.find(s => s.name === shiftName);

    if (!shift) {
      return res.status(404).json({ message: "No shift found with the provided name." });
    }

    // Calculer les créneaux de réservation disponibles
    const reservationInterval = parseInt(shift.reservationInterval); // Par exemple 60 minutes
    const openingTime = moment(shift.openingTime, 'HH:mm');
    const closingTime = moment(shift.closingTime, 'HH:mm');   
    
    // Vérifier si l'heure de réservation demandée est valide dans l'intervalle
    const requestedTime = moment(time, 'HH:mm');
    if (requestedTime.isBefore(openingTime) || requestedTime.isAfter(closingTime)) {
      return res.status(400).json({ message: "Invalid reservation time." });    }
  
    // Calculer l'heure de début du créneau correspondant à l'intervalle
    const intervalStart = openingTime.clone().add(Math.floor(requestedTime.diff(openingTime, 'minutes') / reservationInterval) * reservationInterval, 'minutes');
    const intervalEnd = intervalStart.clone().add(reservationInterval, 'minutes');

    // Compter le nombre total de personnes déjà réservées dans cet intervalle
    const peopleAlreadyReserved = await Reservation.aggregate([
      {
        $match: {
          date: date,
          shiftId: shift._id,
          time: { $gte: intervalStart.format('HH:mm'), $lt: intervalEnd.format('HH:mm') }
        }
      },
      {
        $group: {
          _id: null,
          totalPeople: { $sum: "$peopleCount" }
        }
      }
    ]);
   
    const totalPeopleReserved = peopleAlreadyReserved.length > 0 ? peopleAlreadyReserved[0].totalPeople : 0;

    // Vérifier si l'ajout de cette réservation dépasserait le nombre maximum de personnes autorisées
    if (totalPeopleReserved + peopleCount > shift.maxPeoplePerInterval) {
      return res.status(400).json({ message: `Cannot create reservation: maximum people for this interval reached.` });
    }

    // Create the new reservation
    const newReservation = new Reservation({
      firstname,
      lastname,
      date,
      time: intervalStart.format('HH:mm'),
      phone,
      email,
      shiftId: shift._id,     
      peopleCount
    });

    const reservation = await newReservation.save();
    res.status(201).json({ success: true, data: reservation });
  } catch (err) {
    console.error('Error details:', err);
    res.status(500).json({ error: 'Failed to create reservation', details: err.message });
  }
};



// Update a reservation
reservationController.updateReservation = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const reservation = await Reservation.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!reservation) {
      return res.json({ message: 'Reservation not found' });
    }

    res.status(200).json(reservation);
  } catch (error) {
    res.json({ message: error.message });
  }
};

// Delete a reservation
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
