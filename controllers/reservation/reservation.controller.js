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


reservationController.createReservation = async (req, res) => {
  try {
    const { firstname, lastname, date, time, phone, email, shiftName } = req.body;

    const selectedDay = getDayOfWeek(date);

    // Find the WeeklyScheet with the corresponding day and populate the shifts array
    const scheet = await WeeklyScheet.findOne({ dayname: selectedDay });
    console.log('scheet', scheet)
    if (!scheet) {
      return res.json({ message: "No schedule found for the selected day." });
    }

    if (!scheet.isopen) {
      return res.json({ message: "Reservations are not allowed on this day." });
    }

    // Find the correct shift inside the WeeklyScheet shifts array
    const shift = scheet.shifts.find(s => s.name === shiftName);

    if (!shift) {
      return res.status(400).json({ message: "No shift found with the provided name." });
    }

    const currentReservations = await Reservation.find({ date, shiftId: shift._id }).countDocuments();

    if (currentReservations >= shift.maxReservations) {
      return res.status(400).json({ message: `Cannot create reservation: maximum reservations of ${shift.maxReservations} reached for this shift.` });
    }

    const reservationDuration = parseInt(shift.reservationDuration); // In minutes
    const requestedTime = moment(time, 'HH:mm');
    const requestedEndTime = requestedTime.clone().add(reservationDuration, 'minutes');

    // Check for conflicting reservations
    const conflictingReservations = await Reservation.find({
      date,
      shiftId: shift._id,
      $or: [
        { time: { $gte: requestedTime.format('HH:mm'), $lt: requestedEndTime.format('HH:mm') }},
        { time: { $lte: requestedTime.format('HH:mm'), $gt: moment(requestedTime).subtract(reservationDuration, 'minutes').format('HH:mm') }}
      ]
    });

    if (conflictingReservations.length > 0) {
      return res.status(400).json({ message: "Cannot create reservation: time slot already booked." });
    }

    // Create the new reservation
    const newReservation = new Reservation({
      firstname,
      lastname,
      date,
      time,
      phone,
      email,
      shiftId: shift._id  // Store the shift ID from the WeeklyScheet's shifts array
    });

    const reservation = await newReservation.save();
    res.status(201).json({ success: true, data: reservation });
  } catch (err) {
    console.error('Error details:', err);
    res.json({ error: 'Failed to create reservation', details: err.message });
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
