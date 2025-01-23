const router = require('express').Router();

const WeeklyScheetController = require("../controllers/shift/shift.controller");

router.post('/add-scheet', WeeklyScheetController.createWeeklyScheet);
// router.post('/:id/shifts', WeeklyScheetController.addShiftToWeeklyScheet);
// router.put('/update/:id', WeeklyScheetController.updateWeeklyScheet);
// Mettre à jour un shift spécifique
router.put('/:scheetId/shifts/:shiftId', WeeklyScheetController.updateShift);

// Mettre à jour l'état isopen d'une carte horaire
router.put('/:scheetId', WeeklyScheetController.updateWeeklyScheetIsOpen);

router.get('/get-shifts', WeeklyScheetController.getAllWeeklyScheets);
router.delete('/:scheetId/shift/:shiftId', WeeklyScheetController.deleteShift);
router.post('/:scheetId/shift', WeeklyScheetController.addShift);
// router.put('/updateReservationSettings', WeeklyScheetController.updateReservationSettings);
module.exports = router;