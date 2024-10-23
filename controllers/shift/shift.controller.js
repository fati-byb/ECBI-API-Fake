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
            existingShift.reservationInterval = newShift.reservationInterval || existingShift.reservationInterval;
            existingShift.maxPeoplePerInterval = newShift.maxPeoplePerInterval || existingShift.maxPeoplePerInterval;
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

  // Fonction pour ajouter un shift à une feuille horaire existante
WeeklyScheetController.addShift = async (req, res) => {
  const { scheetId } = req.params; // ID de la feuille horaire
  const { name, openingTime, closingTime, reservationInterval, maxPeoplePerInterval } = req.body; // Détails du nouveau shift

  // Validation des entrées
  if (!name || !openingTime || !closingTime || !reservationInterval || !maxPeoplePerInterval) {
      return res.json({ message: 'Tous les champs sont requis.' });
  }

  try {
      // Chercher la feuille horaire par ID
      const scheet = await WeeklyScheet.findById(scheetId);
      if (!scheet) {
          return res.json({ message: "Feuille horaire non trouvée" });
      }

      // Création du nouveau shift
      const newShift = {
          name,
          openingTime,
          closingTime,
          reservationInterval,
          maxPeoplePerInterval
      };

      // Ajouter le nouveau shift à la liste des shifts
      scheet.shifts.push(newShift);

      // Sauvegarder les modifications
      await scheet.save();

      return res.status(201).json({ message: "Shift ajouté avec succès", scheet });
  } catch (error) {
      return res.json({ message: "Erreur du serveur", error: error.message });
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