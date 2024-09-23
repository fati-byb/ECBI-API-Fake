const Reservation = require("../../models/reservation.model");

const reservationController = {};


reservationController.getReservation = async (req, res) => {
  try {
      console.log('Fetching all reservations');
      
      // Récupérer toutes les réservations
      const reservations = await Reservation.find();
      
      console.log('All reservations:', reservations);
      res.status(200).json(reservations);
  } catch (error) {
      console.error('Error fetching reservations:', error);
      res.status(500).json({ error: 'Failed to fetch reservations' });
  }
};


reservationController.createReservation = async (req, res, next) => {
  console.log('we re here')
  try {
      const {  firstname, lastname,date, time, phone, email } = req.body;

      const existingReserv = await Reservation.findOne({ firstname });
      console.log('existinng point of sale', existingReserv);

      if (existingReserv) {
          return res.json({ success: false, message: 'Reservation with this firstname already exists.' });
      }

      const newReservation = new Reservation({
          firstname,
          lastname,
          date,
          time,
          phone,
          email
      });

      const reservation = await newReservation.save();
      res.status(201).json({ success: true, data: reservation });
  } catch (err) {
      console.error('Error details:', err); // Improved error logging
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
