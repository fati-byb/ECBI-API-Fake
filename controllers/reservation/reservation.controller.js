
const WeeklyScheet = require('../../models/shift.model');
const GlobalSettings = require('../../models/setting.model');
const Reservation = require('../../models/reservation.model');
// const moment = require('moment');
const moment = require('moment-timezone');
// require('moment/locale/fr');
// moment.locale('fr');
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

ensureIndexRemoved();
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


// productController.getProductById = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const product = await Product.findById(id);
//     if (!product) {
//       return res.json({ message: 'Product not found' });
//     }
//     res.status(200).json(product);
//   } catch (error) {
//     console.error('Error fetching product by ID:', error);
//     res.status(500).json({ error: 'Failed to fetch product by ID' });
//   }
// };





//CHANGEMENT

// reservationController.createReservation = async (req, res) => {
//   console.log('were here')
//   try {
//     const { firstname, lastname, date, time, phone, email, shiftName, peopleCount } = req.body;
//     console.log('shift name', shiftName)
//      // Vérifiez que peopleCount est supérieur à 0
//      if (peopleCount <= 0) {
//       return res.json({ message: "Invalid reservation: people count must be greater than 0." });
//     }
    
//  // Convertir la date au format attendu (YYYY-MM-DD)
//  const inputDate = moment(date, ['YYYY-MM-DD', 'MM/DD/YYYY', 'DD-MM-YYYY','ddd. MMM. DD. YYYY HH:mm'], true);
//  if (!inputDate.isValid()) {
//    return res.status(400).json({ message: "Invalid date format. Please use YYYY-MM-DD." });
//  }

//  const formattedDate = inputDate.format('YYYY-MM-DD'); // Formate la date au format attendu
//  console.log('Formatted Date:', formattedDate);

//     const selectedDay = getDayOfWeek(date);
//     const today = moment().startOf('day'); // Start of the current day
     
//     // const inputDate = moment(date, 'YYYY-MM-DD'); 
//      // Récupérer les paramètres globaux
//     const globalSettings = await GlobalSettings.findOne();
//     if (!globalSettings) {
//       return res.json({ message: "Global settings not found." });
//     }
//     const { reservationInterval, maxPeoplePerInterval } = globalSettings;
//     console.log("Retrieved Reservation Interval:", reservationInterval);
//     console.log("Retrieved Reservation max people:", maxPeoplePerInterval);

//     // Trouver le WeeklyScheet correspondant au jour
//     const scheet = await WeeklyScheet.findOne({ dayname: selectedDay });
//     if (!scheet) {
//       return res.json({ message: "No schedule found for the selected day." });
//     }

//     if (!scheet.isopen) {
//       return res.json({ message: "Reservations are not allowed on this day." });
//     }

//     // Trouver le shift correspondant
//     const shift = scheet.shifts.find(s => s.name === shiftName);
//     if (!shift) {
//       return res.json({ message: "No shift found with the provided name." });
//     }

//     // Vérifier si l'heure de réservation demandée est valide dans l'intervalle
//     const openingTime = moment(shift.openingTime, 'HH:mm');
//     const closingTime = moment(shift.closingTime, 'HH:mm');   
 
//     const timezone = "Africa/Casablanca"; // Morocco timezone
    
//     // Parse current and requested time
//     const currentTime = moment().tz(timezone);
//     const requestedTime = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm").tz(timezone);
    
//     // Calculate time difference in minutes
//     const timeDifference = requestedTime.diff(currentTime, "minutes"); // Corrected order for positive difference
    
//     console.log("Current Time:", currentTime.format("YYYY-MM-DD HH:mm:ss Z"));
//     console.log("Requested Time:", requestedTime.format("YYYY-MM-DD HH:mm:ss Z"));
//     console.log("Time Difference (Minutes):", timeDifference);
    
//     // Validate reservation time
//     if (timeDifference < 60) { // Less than 60 minutes
//       return res.json({
//         message: "Reservation time must be at least 1 hour ahead of the current time.",
//       });
//     }
    
    
//    // Ensure the reservation is for today or later
// if (inputDate.isBefore(today, 'day')) {
//   return res.json({ message: "Reservation date must be today or in the future." });
// }


 
// if (inputDate.isSame(today, 'day')) {
//   const timezone = "Africa/Casablanca"; // Morocco timezone

//   const currentTime = moment().tz(timezone);
//   const requestedTime = moment(`${formattedDate} ${time}`, "YYYY-MM-DD HH:mm").tz(timezone);

//   const timeDifferenceMs = currentTime.diff(requestedTime); // In milliseconds
//   const timeDifferenceMinutes = timeDifferenceMs / (1000 * 60); // Convert to minutes

//   console.log('Current Timee:', currentTime.format('HH:mm:ss Z'));
//   console.log('Requested Time:', requestedTime.format('HH:mm:ss Z'));
//   console.log('Time Difference (Minutes):', timeDifferenceMinutes);

//   if (timeDifferenceMinutes > 0 && timeDifferenceMinutes <= 60) {
//     return res.status(400).json({
//       message: "Reservation time must be at least 1 hour ahead of the current time.",
//     });
//   }
// }



// // Proceed with interval calculation and reservation logic
// const intervalStart = openingTime.clone().add(
//   Math.floor(requestedTime.diff(openingTime, 'minutes') / reservationInterval) * reservationInterval,
//   'minutes'
// );
// const intervalEnd = intervalStart.clone().add(reservationInterval, 'minutes');

// // const intervalStart = openingTime.clone().add(
// //   Math.floor(requestedTime.diff(openingTime, 'minutes') / reservationInterval) * reservationInterval,
// //   'minutes'
// // );
// // const intervalEnd = intervalStart.clone().add(reservationInterval, 'minutes');
//     // Calculer le créneau correspondant pour `requestedTime`
//     // Compter le nombre total de personnes déjà réservées dans cet intervalle
//     const peopleAlreadyReserved = await Reservation.aggregate([
//       {
//         $match: {
//           date: date,
//           shiftId: shift._id,
//           time: { $gte: intervalStart.format('HH:mm'), $lt: intervalEnd.format('HH:mm') }
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           totalPeople: { $sum: "$peopleCount" }
//         }
//       }
//     ]);

//     const totalPeopleReserved = peopleAlreadyReserved.length > 0 ? peopleAlreadyReserved[0].totalPeople : 0;
// console.log('total',totalPeopleReserved,'people count',peopleCount,'maxPeople',maxPeoplePerInterval)
//     // Vérifier si le nombre total de personnes dépasse `maxPeoplePerInterval`
//     if (totalPeopleReserved + peopleCount > maxPeoplePerInterval) {
//       return res.status(400).json({ message: `Cannot create reservation: maximum people for this interval reached.` });
//     }
//     // Créer la nouvelle réservation
//     const newReservation = new Reservation({
//       firstname,
//       lastname,
//       date,
//       time,
//       phone,
//       email,
//       shiftId: shift._id,     
//       peopleCount
//     });

    
//     const reservation = await newReservation.save();
// emitNewReservation(newReservation);
//     console.log('newReservation', newReservation);


//     res.json({ success: true, data: reservation });
//   } catch (err) {
//     console.error('Error details:', err);
//     res.json({ error: 'Failed to create reservation', details: err.message });
//   }
// };




// reservationController.createReservation = async (req, res) => {
//   console.log('we are here');
//   try {
//     const { firstname, lastname, date, time, phone, email, shiftName, peopleCount } = req.body;
//     console.log('shift name', shiftName);

//     // Vérifiez que peopleCount est supérieur à 0
//     if (peopleCount <= 0) {
//       return res.json({ message: "Invalid reservation: people count must be greater than 0." });
//     }

//     // Remplacer les abréviations par leurs noms complets
//     const monthMap = {
//       janv: 'janvier',
//       févr: 'février',
//       mars: 'mars',
//       avr: 'avril',
//       mai: 'mai',
//       juin: 'juin',
//       juil: 'juillet',
//       août: 'août',
//       sept: 'septembre',
//       oct: 'octobre',
//       nov: 'novembre',
//       déc: 'décembre'
//     };

//     const dayMap = {
//       jeu: 'jeudi',
//       ven: 'vendredi',
//       sam: 'samedi',
//       dim: 'dimanche',
//       lun: 'lundi',
//       mar: 'mardi',
//       mer: 'mercredi'
//     };

//     // Nettoyer et reformater la date
//     let cleanedDate = date.trim();

//     // Remplacer les jours et mois par leurs équivalents complets
//     Object.keys(monthMap).forEach((key) => {
//       cleanedDate = cleanedDate.replace(new RegExp(key, 'g'), monthMap[key]);
//     });

//     Object.keys(dayMap).forEach((key) => {
//       cleanedDate = cleanedDate.replace(new RegExp(key, 'g'), dayMap[key]);
//     });

//     console.log("Cleaned Date:", cleanedDate);

//     // Format personnalisé attendu : 'jeu. janv. 02. 2025 12:30'
//     const customDateFormat = 'ddd. MMM. DD. YYYY HH:mm'; 

//     // Essayer de parser la date
//     const inputDate = moment(cleanedDate, customDateFormat, true);  // 'true' pour un parsing strict

//     if (!inputDate.isValid()) {
//       return res.json({ message: "Invalid date format. Please use the format 'jeu. janv. 02. 2025 12:30'." });
//     }

//     console.log("Parsed Date:", inputDate.format());

//     const selectedDay = getDayOfWeek(date);
//     const today = moment().startOf('day'); 

//     // Récupérer les paramètres globaux
//     const globalSettings = await GlobalSettings.findOne();
//     if (!globalSettings) {
//       return res.json({ message: "Global settings not found." });
//     }
//     const { reservationInterval, maxPeoplePerInterval } = globalSettings;
//     console.log("Retrieved Reservation Interval:", reservationInterval);
//     console.log("Retrieved Reservation max people:", maxPeoplePerInterval);

//     // Trouver le WeeklyScheet correspondant au jour
//     const scheet = await WeeklyScheet.findOne({ dayname: selectedDay });
//     if (!scheet) {
//       return res.json({ message: "No schedule found for the selected day." });
//     }

//     if (!scheet.isopen) {
//       return res.json({ message: "Reservations are not allowed on this day." });
//     }

//     // Trouver le shift correspondant
//     const shift = scheet.shifts.find(s => s.name === shiftName);
//     if (!shift) {
//       return res.json({ message: "No shift found with the provided name." });
//     }

//     // Vérifier si l'heure de réservation demandée est valide dans l'intervalle
//     const openingTime = moment(shift.openingTime, 'HH:mm');
//     const closingTime = moment(shift.closingTime, 'HH:mm');

//     const timezone = "Africa/Casablanca"; // Morocco timezone

//     // Parse current and requested time
//     const currentTime = moment().tz(timezone);
//     const requestedTime = moment(`${date} ${time}`, "YYYY-MM-DD HH:mm").tz(timezone);

//     // Calculate time difference in minutes
//     const timeDifference = requestedTime.diff(currentTime, "minutes"); // Corrected order for positive difference

//     console.log("Current Time:", currentTime.format("YYYY-MM-DD HH:mm:ss Z"));
//     console.log("Requested Time:", requestedTime.format("YYYY-MM-DD HH:mm:ss Z"));
//     console.log("Time Difference (Minutes):", timeDifference);

//     // Validate reservation time
//     if (timeDifference < 60) { // Less than 60 minutes
//       return res.json({
//         message: "Reservation time must be at least 1 hour ahead of the current time.",
//       });
//     }

//     // Ensure the reservation is for today or later
//     if (inputDate.isBefore(today, 'day')) {
//       return res.json({ message: "Reservation date must be today or in the future." });
//     }

//     // Proceed with interval calculation and reservation logic
//     const intervalStart = openingTime.clone().add(
//       Math.floor(requestedTime.diff(openingTime, 'minutes') / reservationInterval) * reservationInterval,
//       'minutes'
//     );
//     const intervalEnd = intervalStart.clone().add(reservationInterval, 'minutes');

//     // Compter le nombre total de personnes déjà réservées dans cet intervalle
//     const peopleAlreadyReserved = await Reservation.aggregate([
//       {
//         $match: {
//           date: date,
//           shiftId: shift._id,
//           time: { $gte: intervalStart.format('HH:mm'), $lt: intervalEnd.format('HH:mm') }
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           totalPeople: { $sum: "$peopleCount" }
//         }
//       }
//     ]);

//     const totalPeopleReserved = peopleAlreadyReserved.length > 0 ? peopleAlreadyReserved[0].totalPeople : 0;
//     console.log('total', totalPeopleReserved, 'people count', peopleCount, 'maxPeople', maxPeoplePerInterval);
//     // Vérifier si le nombre total de personnes dépasse maxPeoplePerInterval
//     if (totalPeopleReserved + peopleCount > maxPeoplePerInterval) {
//       return res.json({ message: "Cannot create reservation: maximum people for this interval reached." });
//     }

//     // Créer la nouvelle réservation
//     const newReservation = new Reservation({
//       firstname,
//       lastname,
//       date,
//       time,
//       phone,
//       email,
//       shiftId: shift._id,
//       peopleCount
//     });
  
//     const reservation = await newReservation.save();
//     emitNewReservation(newReservation);
//     console.log('newReservation', newReservation);

//     res.json({ success: true, data: reservation });
//   } catch (err) {
//     console.error('Error details:', err);
//     res.json({ error: 'Failed to create reservation', details: err.message });
//   }
// };


// Update a reservation

// reservationController.createReservation = async (req, res) => {
//   console.log('we are here');
//   try {
//     const { firstname, lastname, date, phone, email, shiftName, peopleCount } = req.body;
//     console.log('shift name', shiftName);
    
//     // Vérifiez que peopleCount est supérieur à 0
//     if (peopleCount <= 0) {
//       return res.json({ message: "Invalid reservation: people count must be greater than 0." });
//     }

//     const selectedDay = getDayOfWeek(date);
//     const today = moment().startOf('day');

//     // Utiliser moment pour analyser la date complète (incluant l'heure) au format 'jeu. janv. 02. 2025 12:30'
//     const inputDate = moment(date, 'ddd. MMM. DD. YYYY HH:mm', 'fr');  // Format français
//     console.log('Parsed Date:', inputDate.format());
//     // const time = inputDate.format('HH:mm');

//     // Vérifiez si l'entrée est une date valide
//     if (!inputDate.isValid()) {
//       return res.json({ message: "Invalid date format. Please use 'jeu. janv. 02. 2025 12:30'." });
//     }

//     // Récupérer les paramètres globaux
//     const globalSettings = await GlobalSettings.findOne();
//     if (!globalSettings) {
//       return res.json({ message: "Global settings not found." });
//     }
//     const { reservationInterval, maxPeoplePerInterval } = globalSettings;
//     console.log("Retrieved Reservation Interval:", reservationInterval);
//     console.log("Retrieved Reservation max people:", maxPeoplePerInterval);

//     // Trouver le WeeklyScheet correspondant au jour
//     const scheet = await WeeklyScheet.findOne({ dayname: selectedDay });
//     if (!scheet) {
//       return res.json({ message: "No schedule found for the selected day." });
//     }

//     if (!scheet.isopen) {
//       return res.json({ message: "Reservations are not allowed on this day." });
//     }

//     // Trouver le shift correspondant
//     const shift = scheet.shifts.find(s => s.name === shiftName);
//     if (!shift) {
//       return res.json({ message: "No shift found with the provided name." });
//     }

//     // Vérifier si l'heure de réservation demandée est valide dans l'intervalle
//     const openingTime = moment(shift.openingTime, 'HH:mm');
//     const closingTime = moment(shift.closingTime, 'HH:mm');

//     const timezone = "Africa/Casablanca"; // Morocco timezone

//     // Parse current and requested time from the full date
//     const currentTime = moment().tz(timezone);
//     const requestedTime = moment(date, "ddd. MMM. DD. YYYY HH:mm").tz(timezone);

//     // Calculate time difference in minutes
//     const timeDifference = requestedTime.diff(currentTime, "minutes");

//     console.log("Current Time:", currentTime.format("YYYY-MM-DD HH:mm:ss Z"));
//     console.log("Requested Time:", requestedTime.format("YYYY-MM-DD HH:mm:ss Z"));
//     console.log("Time Difference (Minutes):", timeDifference);

//     // Validate reservation time
//     if (timeDifference < 60) {
//       return res.json({
//         message: "Reservation time must be at least 1 hour ahead of the current time.",
//       });
//     }

//     // Ensure the reservation is for today or later
//     if (inputDate.isBefore(today, 'day')) {
//       return res.json({ message: "Reservation date must be today or in the future." });
//     }

//     // Calculer le créneau correspondant pour requestedTime
//     const intervalStart = openingTime.clone().add(
//       Math.floor(requestedTime.diff(openingTime, 'minutes') / reservationInterval) * reservationInterval,
//       'minutes'
//     );
//     const intervalEnd = intervalStart.clone().add(reservationInterval, 'minutes');

//     // Compter le nombre total de personnes déjà réservées dans cet intervalle
//     const peopleAlreadyReserved = await Reservation.aggregate([
//       {
//         $match: {
//           date: date,  // On suppose ici que `date` est au format Date, sinon il faut utiliser le format exact
//           shiftId: shift._id,
//           // Comparaison de time dans le même format
//         }
//       },
//       {
//         $group: {
//           _id: null,
//           totalPeople: { $sum: "$peopleCount" }
//         }
//       }
//     ]);
    

//     const totalPeopleReserved = peopleAlreadyReserved.length > 0 ? peopleAlreadyReserved[0].totalPeople : 0;
//     console.log('total', totalPeopleReserved, 'people count', peopleCount, 'maxPeople', maxPeoplePerInterval);

//     // Vérifier si le nombre total de personnes dépasse maxPeoplePerInterval
//     if (totalPeopleReserved + peopleCount > maxPeoplePerInterval) {
//       return res.json({ message: "Cannot create reservation: maximum people for this interval reached." });
//     }

//     // Créer la nouvelle réservation
//     const newReservation = new Reservation({
//       firstname,
//       lastname,
//       date,
//       phone,
//       email,
//       shiftId: shift._id,
//       peopleCount
//     });

//     const reservation = await newReservation.save();
//     emitNewReservation(newReservation);
//     console.log('newReservation', newReservation);

//     res.json({ success: true, data: reservation });
//   } catch (err) {
//     console.error('Error details:', err);
//     res.json({ error: 'Failed to create reservation', details: err.message });
//   }
// };
// Load French localization for moment.js



reservationController.createReservation = async (req, res) => {
  try {
    const { firstname, lastname, date, phone, email, shiftName, peopleCount } = req.body;

    // Validate required fields
    if (!firstname || !lastname || !date || !phone || !email || !shiftName || peopleCount === undefined) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (peopleCount <= 0) {
      return res.status(400).json({ message: "Invalid reservation: people count must be greater than 0." });
    }

    // Set moment locale to French (optional)
    // moment.locale('fr');
    const timezone = "Africa/Casablanca"; // Replace with your actual timezone

    // Define the expected date format
    const expectedFormat = "ddd. MMM. DD. YYYY HH:mm";
    const requestedTime = moment.tz(date, expectedFormat, timezone);

    // Validate the date format
    if (!requestedTime.isValid()) {
      return res.status(400).json({
        message: `Invalid date format. Ensure it matches '${expectedFormat}'.`
      });
    }

    // Ensure the reservation time is in the future
    if (requestedTime.isBefore(moment().tz(timezone))) {
      return res.status(400).json({ message: "Reservation time must be in the future." });
    }

    // Get the day of the week
    const selectedDay = getDayOfWeek(requestedTime.format("YYYY-MM-DD"));

    // Fetch the WeeklyScheet for the selected day
    const scheet = await WeeklyScheet.findOne({ dayname: selectedDay });

    if (!scheet || !scheet.isopen) {
      return res.status(400).json({ message: "Reservations are not allowed on this day." });
    }

    // Fetch the shift details
    const shift = scheet.shifts.find(s => s.name === shiftName);
    if (!shift) {
      return res.status(400).json({ message: "No shift found with the provided name." });
    }

    const openingTime = moment.tz(shift.openingTime, 'HH:mm', timezone);
    const closingTime = moment.tz(shift.closingTime, 'HH:mm', timezone);

    const reservationInterval = scheet.reservationInterval || 60; // Default to 60 minutes if not set
    const maxPeoplePerInterval = scheet.maxPeoplePerInterval || 10; // Default to 10 if not set

    // Calculate the reservation interval
    const intervalStart = openingTime.clone().add(
      Math.floor(requestedTime.diff(openingTime, "minutes") / reservationInterval) * reservationInterval,
      "minutes"
    );
    const intervalEnd = intervalStart.clone().add(reservationInterval, "minutes");

    // Validate the requested time falls within the shift timings
    if (requestedTime.isBefore(openingTime) || requestedTime.isAfter(closingTime)) {
      return res.status(400).json({
        message: "Reservation time is outside the shift hours."
      });
    }

    // Fetch existing reservations for the same interval
    const peopleAlreadyReserved = await Reservation.aggregate([
      {
        $match: {
          date: requestedTime.format("YYYY-MM-DD"),
          shiftId: shift._id,
          time: { $gte: intervalStart.format("HH:mm"), $lt: intervalEnd.format("HH:mm") }
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

    // Check if the maximum people limit is exceeded
    if (totalPeopleReserved + peopleCount > maxPeoplePerInterval) {
      return res.status(400).json({
        message: `Cannot create reservation: maximum people for this interval reached.`
      });
    }

    // Create the reservation
    const newReservation = new Reservation({
      firstname,
      lastname,
      date: requestedTime.toISOString(),
      phone,
      email,
      shiftId: shift._id,
      peopleCount,
      time: requestedTime.format("HH:mm") // Ensure the time is saved correctly
    });

    const reservation = await newReservation.save();

    // Optionally emit an event for the new reservation
    emitNewReservation(newReservation);

    res.status(201).json({ success: true, data: reservation });
  } catch (err) {
    console.error("Error in createReservation:", err);
    res.status(500).json({ error: "A server error has occurred", details: err.message });
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
