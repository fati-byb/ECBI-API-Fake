const express = require('express');
const router = express.Router();
const userController = require('../controllers/user/user.controller');

router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.get('/:id/activate', userController.activateUser);

module.exports = router;

