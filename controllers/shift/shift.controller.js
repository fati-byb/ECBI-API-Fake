const WeeklyScheet = require("../../models/shift.model");

// Créer une nouvelle carte d'horaires (weeklyscheet)
const WeeklyScheetController = {};

WeeklyScheetController.getAllWeeklyScheets = async (req, res) => {
    try {
      const weeklyScheets = await WeeklyScheet.find(); 
      res.status(200).json(weeklyScheets);
    } catch (error) {
      res.json({ message: "Erreur lors de la récupération des cartes d'horaires", error });
    }
  };

WeeklyScheetController.createWeeklyScheet = async (req, res) => {
  const { dayname, isopen, shifts } = req.body;

  // Validation des entrées
  if (!dayname || !shifts || shifts.length === 0) {
    return res.json({ message: 'Le nom du jour et au moins un shift sont requis.' });
  }

  try {
   
    const newScheet = new WeeklyScheet({
      dayname,
      isopen,
      shifts
    });

   
    const savedScheet = await newScheet.save();

    
    res.status(201).json(savedScheet);
  } catch (error) {
   
    res.json({ message: 'Erreur lors de la création de la carte', error });
  }
};




WeeklyScheetController.updateWeeklyScheet = async (req, res) => {
    try {
      const { id } = req.params; 
      const { dayname, isopen, shifts } = req.body; 
  
      // Chercher la carte WeeklyScheet par ID
      const weeklyScheet = await WeeklyScheet.findById(id);
      if (!weeklyScheet) {
        return res.json({ message: "WeeklyScheet non trouvée" });
      }
  
      
      if (dayname !== undefined) {
        weeklyScheet.dayname = dayname; 
      }
      if (isopen !== undefined) {
        weeklyScheet.isopen = isopen; 
      }
  
    
      if (shifts) {
        shifts.forEach(newShift => {
          const existingShift = weeklyScheet.shifts.id(newShift._id);
          if (existingShift) {
          
            existingShift.name = newShift.name || existingShift.name;
            existingShift.openingTime = newShift.openingTime || existingShift.openingTime;
            existingShift.closingTime = newShift.closingTime || existingShift.closingTime;
            existingShift.reservationDuration = newShift.reservationDuration || existingShift.reservationDuration;
            existingShift.maxReservations = newShift.maxReservations || existingShift.maxReservations;
          } else {
            // Ajouter un nouveau shift si l'ID n'existe pas
            weeklyScheet.shifts.push(newShift);
          }
        });
      }
  
     
      await weeklyScheet.save();
      res.status(200).json(weeklyScheet);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error });
    }
  };

  // Fonction pour supprimer un shift par son ID
  WeeklyScheetController.deleteShift = async (req, res) => {
    const { scheetId, shiftId } = req.params;
  
    try {
      // Trouver la feuille horaire par son ID
      const scheet = await WeeklyScheet.findById(scheetId);
  
      if (!scheet) {
        return res.json({ message: "Feuille horaire non trouvée" });
      }
  
      // Supprimer le shift du tableau des shifts en filtrant celui avec le shiftId
      scheet.shifts = scheet.shifts.filter(shift => shift._id.toString() !== shiftId);
  
      // Sauvegarder les modifications
      await scheet.save();
  
      return res.status(200).json({ message: "Shift supprimé avec succès", scheet });
    } catch (error) {
      return res.json({ message: "Erreur du serveur", error: error.message });
    }
  };
  


module.exports = WeeklyScheetController;