 const router = require('express').Router();
const restaurantController = require('../controllers/restaurants/restaurant.controller');

router.post('/add-pointvente', restaurantController.createRestaurant);
router.get('/get-pointvente', restaurantController.getRestaurant);


router.get('/archived', restaurantController.getArchivedRestaurants);
router.put('/archived-pointvente/:id', restaurantController.archiveRestaurant)
 
module.exports = router;
