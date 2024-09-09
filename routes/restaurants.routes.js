 const router = require('express').Router();
const restaurantController = require('../controllers/restaurants/restaurant.controller');

router.post('/addResto', restaurantController.createRestaurant);
router.delete('/deleteResto/:id', restaurantController.deleteRestaurant);
router.get('/getResto', restaurantController.getRestaurant);
router.put('/updateResto/:id', restaurantController.updateRestaurant);
module.exports = router;
