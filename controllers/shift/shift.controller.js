
const mongoose = require('mongoose');
const WeeklyScheet = require("../../models/shift.model");

const WeeklyScheetController = {};

// Récupérer toutes les cartes d'horaires
WeeklyScheetController.getAllWeeklyScheets = async (req, res) => {
  try {
    const weeklyScheets = await WeeklyScheet.find();
    res.status(200).json(weeklyScheets);
  } catch (error) {
    res.json({ message: "Erreur lors de la récupération des cartes d'horaires", error });
  }
};

// Créer une nouvelle carte d'horaires
WeeklyScheetController.createWeeklyScheet = async (req, res) => {
  const { dayname, isopen, shifts} = req.body;

  if (!dayname || !shifts || shifts.length === 0) {
    return res.json({ message: 'Le nom du jour, les shifts et les paramètres globaux sont requis.' });
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

// Mettre à jour une carte d'horaires
// WeeklyScheetController.updateWeeklyScheet = async (req, res) => {
//   const { id } = req.params;
//   const { dayname, isopen, shifts} = req.body;

//   try {
//     const weeklyScheet = await WeeklyScheet.findById(id);
//     if (!weeklyScheet) {
//       return res.json({ message: "WeeklyScheet non trouvée" });
//     }
  
//     console.log("Avant la mise à jour:", weeklyScheet);
  
//     if (dayname !== undefined) {
//       weeklyScheet.dayname = dayname;
//       console.log("Nouveau dayname:", dayname);
//     }
  
//     if (isopen !== undefined) {
//       weeklyScheet.isopen = isopen;
//       console.log("Nouveau isopen:", isopen);
//     }
  
//     if (shifts) {
//       shifts.forEach(newShift => {
//         console.log("Shift reçu:", newShift);
//         const existingShift = weeklyScheet.shifts.id(newShift._id);
//         if (existingShift) {
//           existingShift.name = newShift.name || existingShift.name;
//           existingShift.openingTime = newShift.openingTime || existingShift.openingTime;
//           existingShift.closingTime = newShift.closingTime || existingShift.closingTime;
//           existingShift.duréeDeReservation = newShift.duréeDeReservation || existingShift.duréeDeReservation;
//           console.log("Shift mis à jour:", existingShift);
//         } else {
//           weeklyScheet.shifts.push(newShift);
//           console.log("Nouveau shift ajouté:", newShift);
//         }
//       });
//     }
  
//     await weeklyScheet.save();
//     console.log("Après la mise à jour:", weeklyScheet);
  
//     res.status(200).json(weeklyScheet);
//   } catch (error) {
//     console.error("Erreur serveur:", error);
//     res.status(500).json({ message: "Erreur serveur", error });
//   }
// }   



WeeklyScheetController.updateShift = async (req, res) => {
  const { scheetId, shiftId } = req.params;
  const { name, openingTime, closingTime, duréeDeReservation } = req.body;

  try {
    const scheet = await WeeklyScheet.findById(scheetId);
    if (!scheet) {
      return res.status(404).json({ message: "Feuille horaire non trouvée" });
    }

    const shift = scheet.shifts.id(shiftId);
    if (!shift) {
      return res.status(404).json({ message: "Shift non trouvé" });
    }

    // Mettre à jour les champs du shift
    if (name !== undefined) shift.name = name;
    if (openingTime !== undefined) shift.openingTime = openingTime;
    if (closingTime !== undefined) shift.closingTime = closingTime;
    if (duréeDeReservation !== undefined) shift.duréeDeReservation = duréeDeReservation;

    await scheet.save();

    return res.status(200).json({ message: "Shift mis à jour avec succès", scheet });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};


WeeklyScheetController.updateWeeklyScheetIsOpen = async (req, res) => {
  const { scheetId } = req.params;
  const { isopen } = req.body;

  if (isopen === undefined) {
    return res.status(400).json({ message: "Le champ 'isopen' est requis." });
  }

  try {
    const scheet = await WeeklyScheet.findById(scheetId);
    if (!scheet) {
      return res.status(404).json({ message: "Feuille horaire non trouvée" });
    }

    // Mettre à jour le champ isopen
    scheet.isopen = isopen;

    await scheet.save();

    return res.status(200).json({ message: "État 'isopen' mis à jour avec succès", scheet });
  } catch (error) {
    return res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};



// Ajouter un shift à une carte horaire existante
WeeklyScheetController.addShift = async (req, res) => {
  const { scheetId } = req.params; 
  const { name, openingTime, closingTime,duréeDeReservation } = req.body; 

  if (!name || !openingTime || !closingTime || !duréeDeReservation) {
    return res.json({ message: 'Tous les champs du shift sont requis.' });
  }

  try {
    const scheet = await WeeklyScheet.findById(scheetId);
    if (!scheet) {
      return res.json({ message: "Feuille horaire non trouvée" });
    }

    const newShift = {
      name,
      openingTime,
      closingTime,
      duréeDeReservation
    };

    scheet.shifts.push(newShift);

    await scheet.save();

    return res.status(201).json({ message: "Shift ajouté avec succès", scheet });
  } catch (error) {
    return res.json({ message: "Erreur du serveur", error: error.message });
  }
};  
// Supprimer un shift par son ID
WeeklyScheetController.deleteShift = async (req, res) => {
  const { scheetId, shiftId } = req.params;

  try {
    const scheet = await WeeklyScheet.findById(scheetId);
    if (!scheet) {
      return res.json({ message: "Feuille horaire non trouvée" });
    }

    scheet.shifts = scheet.shifts.filter(shift => shift._id.toString() !== shiftId);

    await scheet.save();

    return res.status(200).json({ message: "Shift supprimé avec succès", scheet });
  } catch (error) {
    return res.json({ message: "Erreur du serveur", error: error.message });
  }
};


module.exports = WeeklyScheetController;
