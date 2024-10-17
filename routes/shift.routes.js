const router = require('express').Router();

const WeeklyScheetController = require("../controllers/shift/shift.controller");

router.post('/add-scheet', WeeklyScheetController.createWeeklyScheet);
// router.post('/:id/shifts', WeeklyScheetController.addShiftToWeeklyScheet);
router.put('/update/:id', WeeklyScheetController.updateWeeklyScheet);
router.get('/', WeeklyScheetController.getAllWeeklyScheets);
router.delete('/:scheetId/shift/:shiftId', WeeklyScheetController.deleteShift);

module.exports = router;