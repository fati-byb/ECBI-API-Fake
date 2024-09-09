const router = require('express').Router();
const userController = require('../controllers/user/user.controller');


router.post('/users', userController.createUser);
router.put('/users/:id', userController.updateUser);
router.get('/users/:id/activate', userController.activateUser);

module.exports = router;
