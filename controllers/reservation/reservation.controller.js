const Reservation = require("../../models/reservation.model");
const WeeklyScheet = require('../../models/shift.model');
const moment = require('moment');
const Shift = require('../../models/shift.model')
const reservationController = {};

// Function to get the day of the week
const getDayOfWeek = (dateString) => {
  const date = new Date(dateString);
  const days = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  return days[date.getDay()];
};

// Update the reservation status
reservationController.updateReservationStatus = async (req, res) => {
  const { id } = req.params; // Reservation ID passed as a URL parameter
  const { status } = req.body; // Status field passed in the request body
console.log('ststus', status)
  if (!status) {
    return res.status(400).json({ message: 'Status is required to update reservation' });
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
      return res.status(404).json({ message: 'Reservation not found' });
    }

    res.status(200).json(reservation);
  } catch (error) {
    res.status(500).json({ message: 'Error updating reservation status', details: error.message });
  }
};


reservationController.getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find().populate("table");
    const populatedReservations = await Promise.all(reservations.map(async reservation => {
      const scheet = await WeeklyScheet.findOne({ "shifts._id": reservation.shiftId });
      const shift = scheet.shifts.id(reservation.shiftId); // Get the shift details

      return {
        ...reservation.toObject(),
        shift: shift ? {
          _id: shift._id,
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
    const { firstname, lastname, date, time, phone, email, shiftName, peopleCount } = req.body;

    const selectedDay = getDayOfWeek(date);

    // Find the WeeklyScheet with the corresponding day and populate the shifts array
    const scheet = await WeeklyScheet.findOne({ dayname: selectedDay });
    if (!scheet) {
      return res.status(404).json({ message: "No schedule found for the selected day." });
    }

    if (!scheet.isopen) {
      return res.status(400).json({ message: "Reservations are not allowed on this day." });
    }

    const today = moment().startOf('day');  // Set today to 00:00:00 using Moment.js
    const inputDate = moment(date).startOf('day');  // Set inputDate to 00:00:00 using Moment.js

    if (inputDate.isBefore(today)) {
      return res.status(400).json({ message: "Enter a valid date!" });
    }

    // Find the correct shift inside the WeeklyScheet shifts array
    const shift = scheet.shifts.find(s => s.name === shiftName);

    if (!shift) {
      return res.status(404).json({ message: "No shift found with the provided name." });
    }

    const reservationInterval = parseInt(shift.reservationInterval); // e.g., 60 minutes
    const openingTime = moment(shift.openingTime, 'HH:mm');
    const closingTime = moment(shift.closingTime, 'HH:mm');

    const requestedTime = moment(time, 'HH:mm');
    const currentTime = moment();

    // Ensure the reservation time is within the shift time and is not in the past
    if (requestedTime.isBefore(openingTime) || requestedTime.isAfter(closingTime)) {
      return res.status(400).json({ message: "Invalid reservation time." });
    }

    // Check if requested time is in the future or is now
    if (inputDate.isSame(today, 'day') && requestedTime.isBefore(currentTime)) {
      return res.status(400).json({ message: "Reservation time must be now or in the future." });
    }

    const intervalStart = openingTime.clone().add(Math.floor(requestedTime.diff(openingTime, 'minutes') / reservationInterval) * reservationInterval, 'minutes');
    const intervalEnd = intervalStart.clone().add(reservationInterval, 'minutes');

    // Calculate total people reserved within this interval
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

    if (totalPeopleReserved + peopleCount > shift.maxPeoplePerInterval) {
      return res.status(400).json({ message: "Cannot create reservation: maximum people for this interval reached." });
    }

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
