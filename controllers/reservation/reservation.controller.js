
const WeeklyScheet = require('../../models/shift.model');
const GlobalSettings = require('../../models/setting.model');
const Reservation = require('../../models/reservation.model');
 

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
    const reservations = await Reservation.find()
      .sort({ date: -1 })
      .skip(Number(skip))
      .limit(Number(limit));

    console.log('Reservations fetched:', reservations.length);

    // Populate shift details for each reservation
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
  console.log('req', req.body)
ensureIndexRemoved();

  try {
    const { firstname, lastname, date, phone, email, shiftName, peopleCount } = req.body;
    console.log('Raw date from request:', date);

    // Directly parse the ISO date string into a Moment object
    const inputDate = moment(date); // No need to provide a format for ISO strings
    console.log('Parsed Moment date:', inputDate.format('YYYY-MM-DD HH:mm'));

    // Validate date and people count
    if (!inputDate.isValid()) {
      return res.status(400).json({ message: "Invalid date format. Ensure the date is in ISO 8601 format." });
    }

    if (peopleCount <= 0) {
      return res.status(400).json({ message: "People count must be greater than 0." });
    }

    if (inputDate.isBefore(moment())) {
      return res.status(400).json({ message: "Reservation time must be in the future." });
    }

    const globalSettings = await GlobalSettings.findOne();
    if (!globalSettings) {
      return res.status(500).json({ message: "Global settings not configured." });
    }
    const { reservationInterval, maxPeoplePerInterval } = globalSettings;

    const dayOfWeek = inputDate.format('dddd').toLowerCase();
    console.log('Day of the week:', dayOfWeek);

    const scheet = await WeeklyScheet.findOne({ dayname: dayOfWeek });
    if (!scheet || !scheet.isopen) {
      return res.status(400).json({ message: "Reservations are not allowed on this day." });
    }

    // Fetch the shift details
    const shift = scheet.shifts.find(s => s.name === shiftName);
    if (!shift) {
      return res.status(400).json({ message: "Shift not found." });
    }

    const requestedTime = inputDate.format('HH:mm');
    if (
      requestedTime < moment(shift.openingTime, 'HH:mm').format('HH:mm') ||
      requestedTime > moment(shift.closingTime, 'HH:mm').format('HH:mm')
    ) {
      return res.status(400).json({ message: "Reservation time is outside of shift hours." });
    }

    // Check for existing reservations in the interval
    const intervalStart = inputDate.clone().startOf('minute').subtract(inputDate.minute() % reservationInterval, 'minutes');
    const intervalEnd = intervalStart.clone().add(reservationInterval, 'minutes');

    const existingReservations = await Reservation.aggregate([
      {
        $match: {
          date: inputDate.format('YYYY-MM-DD'),
          time: { $gte: intervalStart.format('HH:mm'), $lt: intervalEnd.format('HH:mm') },
          shiftId: shift._id
        }
      },
      { $group: { _id: null, totalPeople: { $sum: '$peopleCount' } } }
    ]);

    const totalPeopleReserved = existingReservations.length ? existingReservations[0].totalPeople : 0;
    if (totalPeopleReserved + peopleCount > maxPeoplePerInterval) {
      return res.status(400).json({ message: "Maximum capacity reached for this interval." });
    }

    // Save reservation
    const newReservation = new Reservation({
      firstname,
      lastname,
      date: inputDate.format('YYYY-MM-DD'),
      time: inputDate.format('HH:mm'),
      phone,
      email,
      shiftId: shift._id,
      peopleCount,
      time: requestedTime.format("HH:mm") // Ensure the time is saved correctly
    });

    const savedReservation = await newReservation.save();
    emitNewReservation(newReservation);

    res.status(201).json({ success: true, data:
      
      savedReservation,
      createdAt: moment(savedReservation.createdAt).toISOString(),
      updatedAt: moment(savedReservation.updatedAt).toISOString()
    });
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(500).json({ message: "Failed to create reservation.", error: error.message });
  }
};




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
