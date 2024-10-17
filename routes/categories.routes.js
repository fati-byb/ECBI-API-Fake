const router = require('express').Router();
const categoryController = require('../controllers/categories/category.controller');

router.post('/add-category',categoryController.createCategory);
router.get('/get-categories',categoryController.getCategories);
router.delete('/delete/:id', categoryController.deleteCategory);
router.put('/update/:id', categoryController.updateCategory);

// router.get('/get-pointvente', pointDeVenteController.getRestaurant);
// router.put('/updateResto/:id', pointDeVenteController.updateRestaurant);


// router.get('/archived', pointDeVenteController.getArchivedRestaurants);
// router.put('/archived-pointvente/:id', pointDeVenteController.archiveRestaurant)
// router.put('/unarchived-pointvente/:id', pointDeVenteController.unarchiveRestaurant)
 
module.exports = router;
