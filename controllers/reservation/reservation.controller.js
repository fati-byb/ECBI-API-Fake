
const WeeklyScheet = require('../../models/shift.model');
const GlobalSettings = require('../../models/setting.model');
const Reservation = require('../../models/reservation.model');
const PointDeVente = require("../../models/pointdevente.model");
 

const moment = require('moment');
require('moment/locale/fr'); // Import French locale

// Set the locale globally
moment.locale('fr');


const dayjs = require('dayjs');
const { emitNewReservation } = require('../../app');
const reservationController = {};
const today = dayjs().startOf('day'); // Start of today for comparison
const currentTime = dayjs();

const getDayOfWeek = (dateString) => {
  const date = new Date(dateString);
  const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  return days[date.getDay()];
};


const ensureIndexRemoved = async () => {
  try {
    const indexes = await Reservation.collection.indexes();
    const emailIndex = indexes.find(index => index.name === 'email_1');
    if (emailIndex) {
      await Reservation.collection.dropIndex('email_1');
      console.log('Unique index on email field has been removed.');
    }
  } catch (error) {
    console.error('Error while removing index:', error.message);
  }
};


reservationController.getReservations = async (req, res) => {

  const { page = 1, limit = 5 } = req.query; // Defaults: page 1, 10 items per page
  const skip = (page - 1) * limit;

  try {
    // Count total reservations for pagination
    const totalReservations = await Reservation.countDocuments();

    // Fetch reservations sorted by reservationDate in descending order
    const reservations = await Reservation.find().populate({ path: 'pointDeVente', select: 'name' })
    .sort({ createdAt: -1 })
      .skip(Number(skip))
      .limit(Number(limit))
      
      ;

    console.log('Reservations fetched:', reservations.length);

     const populatedReservations = await Promise.all(
      reservations.map(async (reservation) => {
        const scheet = await WeeklyScheet.findOne({ "shifts._id": reservation.shiftId });
        const shift = scheet?.shifts.id(reservation.shiftId);

        return {
          ...reservation.toObject(),
          shift: shift
            ? {
              _id: shift._id,
              name: shift.name,
              openingTime: shift.openingTime,
              closingTime: shift.closingTime,
            }
            : null,
        };
      })
    );

    // Respond with the paginated, sorted, and populated data
    res.json({
      data: populatedReservations,
      currentPage: Number(page),
      totalPages: Math.ceil(totalReservations / limit),
    });
  } catch (err) {
    console.error(err.message); // Log the error for debugging
    res.status(500).json({ error: 'Failed to fetch reservations', details: err.message });
  }
};


reservationController.getOneReservation = async (req, res) => {
  try {
    const { id } = req.params; // Récupération de l'identifiant de la réservation
    const reservation = await Reservation.findById(id); // Trouver la réservation et peupler la table associée

    if (!reservation) {
      return res.json({ error: "Réservation non trouvée" });
    }

    res.status(200).json(reservation);
  } catch (err) {
    res.json({ error: "Erreur lors de la récupération de la réservation", details: err.message });
  }
};



 

reservationController.createReservation = async (req, res) => {
  console.log('Request body:', req.body);

  try {
    const { firstname, lastname, date, phone, email, shiftName, peopleCount, pointDeVenteName } = req.body;

    if (!date) {
      return res.status(400).json({ message: "Date is required." });
    }

    const reservationDate = new Date(date);
    if (isNaN(reservationDate.getTime())) {
      return res.status(400).json({ message: "Invalid date format." });
    }

    if (reservationDate < new Date()) {
      return res.status(400).json({ message: "Reservation time must be in the future." });
    }

     const minutes = reservationDate.getMinutes();
    if (minutes === 0) {
       reservationDate.setSeconds(0);
    } else if (minutes <= 30) {
       reservationDate.setMinutes(30);
      reservationDate.setSeconds(0);
    } else {
       reservationDate.setHours(reservationDate.getHours() + 1);
      reservationDate.setMinutes(0);
      reservationDate.setSeconds(0);
    }

    if (peopleCount <= 0) {
      return res.status(400).json({ message: "People count must be greater than 0." });
    }

    const pointDeVente = await PointDeVente.findOne({ name: pointDeVenteName });
    if (!pointDeVente) {
      return res.status(404).json({ message: "Point de Vente not found." });
    }

    const globalSettings = await GlobalSettings.findOne();
    if (!globalSettings) {
      return res.status(500).json({ message: "Global settings not configured." });
    }
    const { reservationInterval, maxPeoplePerInterval } = globalSettings;

    const dayOfWeek = reservationDate.toLocaleDateString('fr-FR', { weekday: 'long' }).toLowerCase();
    console.log('Jour de la semaine (en français) :', dayOfWeek);

    const scheet = await WeeklyScheet.findOne({ dayname: dayOfWeek });
    if (!scheet || !scheet.isopen) {
      return res.status(400).json({ message: "Reservations are not allowed on this day." });
    }

    // Fetch the shift details
    const shift = scheet.shifts.find(s => s.name === shiftName);
    if (!shift) {
      return res.status(400).json({ message: "Shift not found." });
    }

    const requestedTime = reservationDate.toISOString().substring(11, 16); 
    const openingTime = shift.openingTime;
    const closingTime = shift.closingTime;

    if (requestedTime < openingTime || requestedTime > closingTime) {
      return res.status(400).json({ message: "Reservation time is outside of shift hours." });
    }

    const intervalStart = new Date(reservationDate);
    intervalStart.setMinutes(reservationDate.getMinutes() - (reservationDate.getMinutes() % reservationInterval));
    const intervalEnd = new Date(intervalStart);
    intervalEnd.setMinutes(intervalStart.getMinutes() + reservationInterval);

    const existingReservations = await Reservation.aggregate([
      {
        $match: {
          date: { $gte: intervalStart, $lt: intervalEnd },
          shiftId: shift._id,
        },
      },
      { $group: { _id: null, totalPeople: { $sum: '$peopleCount' } } },
    ]);

    const totalPeopleReserved = existingReservations.length ? existingReservations[0].totalPeople : 0;
    if (totalPeopleReserved + peopleCount > maxPeoplePerInterval) {
      return res.status(400).json({ message: "Maximum capacity reached for this interval." });
    }

    const newReservation = new Reservation({
      firstname,
      lastname,
      date: reservationDate.toISOString(),
      phone,
      email,
      shiftId: shift._id,
      peopleCount,
      pointDeVente: pointDeVente._id,
    });

    const savedReservation = await newReservation.save();
    emitNewReservation(savedReservation);

    res.status(201).json({
      success: true,
      data: savedReservation,
      createdAt: savedReservation.createdAt.toISOString(),
      updatedAt: savedReservation.updatedAt.toISOString(),
    });
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(500).json({ message: "Failed to create reservation.", error: error.message });
  }
};




// reservationController.updateReservation = async (req, res) => {
//   const { id } = req.params;
//   const updateData = req.body;
// console.log('data', updateData)
//   // Function to format date and time into ISO 8601 format
//   const formatDateTime = (date, time) => {
//     const formattedDateTime = new Date(`${date}T${time}:00.000Z`);
//     return formattedDateTime.toISOString();
//   };
// console.log('format', formatDateTime)
//    if (updateData.date && updateData.time) {
//     updateData.dateTime = formatDateTime(updateData.date, updateData.time);
//     delete updateData.date; // Remove raw date field
//     delete updateData.time; // Remove raw time field
//   }

//   // Ensure status is always set to "en attente"
//   updateData.status = "en attente";

//   try {
//     const reservation = await Reservation.findByIdAndUpdate(
//       id,
//       { $set: updateData },
//       { new: true, runValidators: true }
//     );

//     if (!reservation) {
//       return res.json({ message: 'Reservation not found' });
//     }

//     res.json(reservation);
//   } catch (error) {
//     res.json({ message: error.message });
//   }
// };

reservationController.updateReservation = async (req, res) => {

  const { id } = req.params;
  const updateData = req.body;
  console.log('updated table', updateData)
  // updateData.status = "en attente";

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
  console.log('we re here 2')
  const { id } = req.params; // Reservation ID passed as a URL parameter
  const { status } = req.body;
  console.log('id', id,status)

  // Status field passed in the request body
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
    res.json({ message: 'Error updating reservation status' });
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


