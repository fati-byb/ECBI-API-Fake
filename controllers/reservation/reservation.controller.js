
const WeeklyScheet = require('../../models/shift.model');
const GlobalSettings = require('../../models/setting.model');
const Reservation = require('../../models/reservation.model');
const moment = require('moment-timezone');

 const dayjs = require('dayjs');
const { emitNewReservation } = require('../../app');
const reservationController = {};
 // Get current time
 const today = dayjs().startOf('day'); // Start of today for comparison
 const currentTime = dayjs();
// Function to get the day of the week
const getDayOfWeek = (dateString) => {
  const date = new Date(dateString);
  const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  return days[date.getDay()];
};

// reservationController.getReservationById = async (req, res) => {
//   const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res.json({ error: 'Reservation ID is required' });
//   }

//   try {
//     const reservation = await Reservation.findById(id);

//     if (!reservation) {
//       return res.json({ error: 'Reservation not found' });
//     }

//     const scheet = await WeeklyScheet.findOne({ "shifts._id": reservation.shiftId });
//     const shift = scheet ? scheet.shifts.id(reservation.shiftId) : null;

//     const populatedReservation = {
//       ...reservation.toObject(),
//       shift: shift ? {
//         _id: shift._id,
//         name: shift.name,
//         openingTime: shift.openingTime,
//         closingTime: shift.closingTime
//       } : null
//     };

//     res.json(populatedReservation);
//   } catch (err) {
//     res.json({ error: 'Failed to fetch reservation', details: err.message });
//   }
// };

reservationController.getReservations = async (req, res) => {


  try {
    const reservations = await Reservation.find().populate("table");
  console.log('we re here 0')

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


//CHANGEMENT

reservationController.createReservation = async (req, res) => {
  console.log('were here')
  try {
    const { firstname, lastname, date, time, phone, email, shiftName, peopleCount } = req.body;
    console.log('shift name', shiftName)
     // Vérifiez que peopleCount est supérieur à 0
     if (peopleCount <= 0) {
      return res.json({ message: "Invalid reservation: people count must be greater than 0." });
    }


    const selectedDay = getDayOfWeek(date);
    const today = moment().startOf('day'); // Start of the current day
     
    const inputDate = moment(date, 'YYYY-MM-DD'); // Parse the date from request body
     // Récupérer les paramètres globaux
    const globalSettings = await GlobalSettings.findOne();
    if (!globalSettings) {
      return res.json({ message: "Global settings not found." });
    }
    const { reservationInterval, maxPeoplePerInterval } = globalSettings;
    console.log("Retrieved Reservation Interval:", reservationInterval);
    console.log("Retrieved Reservation max people:", maxPeoplePerInterval);

    // Trouver le WeeklyScheet correspondant au jour
    const scheet = await WeeklyScheet.findOne({ dayname: selectedDay });
    if (!scheet) {
      return res.json({ message: "No schedule found for the selected day." });
    }

    if (!scheet.isopen) {
      return res.json({ message: "Reservations are not allowed on this day." });
    }

    // Trouver le shift correspondant
    const shift = scheet.shifts.find(s => s.name === shiftName);
    if (!shift) {
      return res.json({ message: "No shift found with the provided name." });
    }

    // Vérifier si l'heure de réservation demandée est valide dans l'intervalle
    const openingTime = moment(shift.openingTime, 'HH:mm');
    const closingTime = moment(shift.closingTime, 'HH:mm');   
 
    const timezone = "Africa/Casablanca"; // Morocco timezone

    // Parse current and requested time
    const currentTime = moment().tz(timezone);
    const requestedTime = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm").tz(timezone);
    
    // Calculate time difference in minutes
    const timeDifference = requestedTime.diff(currentTime, "minutes"); // Corrected order for positive difference
    
    console.log("Current Time:", currentTime.format("YYYY-MM-DD HH:mm:ss Z"));
    console.log("Requested Time:", requestedTime.format("YYYY-MM-DD HH:mm:ss Z"));
    console.log("Time Difference (Minutes):", timeDifference);
    
    // Validate reservation time
    if (timeDifference < 60) { // Less than 60 minutes
      return res.json({
        message: "Reservation time must be at least 1 hour ahead of the current time.",
      });
    }
    
    
   // Ensure the reservation is for today or later
if (inputDate.isBefore(today, 'day')) {
  return res.json({ message: "Reservation date must be today or in the future." });
}


 
if (inputDate.isSame(today, 'day')) {
  const timezone = "Africa/Casablanca"; // Morocco timezone

  const currentTime = moment().tz(timezone); // Adjust timezone
  const requestedTime = moment(time, 'HH:mm').tz(timezone); // Ensure the same timezone

  const timeDifferenceMs = currentTime.diff(requestedTime); // In milliseconds
  const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60); // Convert to minutes

  console.log('Current Timee:', currentTime.format('HH:mm:ss Z'));
  console.log('Requested Time:', requestedTime.format('HH:mm:ss Z'));
  console.log('Time Difference (Minutes):', timeDifferenceMinutes);

  if (timeDifferenceMinutes > 0 && timeDifferenceMinutes <= 60) {
    return res.status(400).json({
      message: "Reservation time must be at least 1 hour ahead of the current time.",
    });
  }
}



// Proceed with interval calculation and reservation logic
const intervalStart = openingTime.clone().add(
  Math.floor(requestedTime.diff(openingTime, 'minutes') / reservationInterval) * reservationInterval,
  'minutes'
);
const intervalEnd = intervalStart.clone().add(reservationInterval, 'minutes');

// const intervalStart = openingTime.clone().add(
//   Math.floor(requestedTime.diff(openingTime, 'minutes') / reservationInterval) * reservationInterval,
//   'minutes'
// );

// const intervalEnd = intervalStart.clone().add(reservationInterval, 'minutes');

    // Calculer le créneau correspondant pour `requestedTime`
    
 
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
console.log('total',totalPeopleReserved,'people count',peopleCount,'maxPeople',maxPeoplePerInterval)
    // Vérifier si le nombre total de personnes dépasse `maxPeoplePerInterval`
    if (totalPeopleReserved + peopleCount > maxPeoplePerInterval) {
      return res.status(400).json({ message: `Cannot create reservation: maximum people for this interval reached.` });
    }

    // Créer la nouvelle réservation
    const newReservation = new Reservation({
      firstname,
      lastname,
      date,
      time,
      phone,
      email,
      shiftId: shift._id,     
      peopleCount
    });

    
    const reservation = await newReservation.save();
emitNewReservation(newReservation);
    console.log('newReservation', newReservation);


    res.json({ success: true, data: reservation });
  } catch (err) {
    console.error('Error details:', err);
    res.json({ error: 'Failed to create reservation', details: err.message });
  }
};



// Update a reservation
reservationController.updateReservation = async (req, res) => {

  const { id } = req.params;
  const updateData = req.body;
  console.log('updated table', updateData)


  try {
    const reservation = await Reservation.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });

    if (!reservation) {
      return res.json({ message: 'Reservation not found' });
    }

    res.json(reservation);
  } catch (error) {
    res.json({ message: error.message });
  }
};

//update reservation status 

reservationController.updateReservationStatus = async (req, res) => {
  // console.log('we re here 2')
  const { id } = req.params; // Reservation ID passed as a URL parameter
  const { status } = req.body; // Status field passed in the request body
  console.log('updated status', status)

  if (!status) {
    return res.json({ message: 'Status is required to update reservation' });
  }

  try {
    // Find the reservation by ID and update only the status field
    const reservation = await Reservation.findByIdAndUpdate(
      id,
      { status },
      {
        new: true,          // Return the updated document
        runValidators: true // Ensure validation is run on the update
      }
    );

    if (!reservation) {
      return res.json({ message: 'Reservation not found' });
    }

    res.json(reservation);
  } catch (error) {
    res.json({ message: 'Error updating reservation status'});
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
