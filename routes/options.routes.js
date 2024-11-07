// routes/optionRoutes.js
const express = require('express');
const router = express.Router();
const optionController = require('../controllers/options/option.controller');

// Route to create a new option
router.post('/addOptions', optionController.createOption);
router.get('/getOptions', optionController.getProductsOptions)
// Add routes for updating, deleting, and getting options as needed

module.exports = router;
