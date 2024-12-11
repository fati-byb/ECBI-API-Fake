// routes/optionRoutes.js
const express = require('express');
const router = express.Router();
const gainController = require('../controllers/gains/gain.controller');

// Route to create a new option
// router.post('/addOptions', optionController.createOption);
router.get('/getGains', gainController.getGains);
router.post('/addGain', gainController.createGain);

// router.put('/update/:optionId', optionController.updateOption); // Update route
// router.delete('/delete/:optionId', optionController.deleteOption); // De


module.exports = router;
