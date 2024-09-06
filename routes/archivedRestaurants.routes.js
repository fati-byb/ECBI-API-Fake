const express = require('express');
const router = express.Router();
const archivedRestaurantController = require('../controllers/archivedResaurant/archivedRestaurant.controller');

// Define the routes here
router.post('/addArchivedResto', archivedRestaurantController.createArchivedRestaurant);
router.get('/getArchivedResto', archivedRestaurantController.getArchivedRestaurant)
module.exports = router;
