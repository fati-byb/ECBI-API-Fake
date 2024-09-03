const User = require('../models/user.model');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose')
const userController = {};

userController.createUser = async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;
        // You might want to hash the password before saving
        const newUser = new User({
            username,
            email,
            password,
            role
        });

        const user = await newUser.save();
        res.status(201).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};


userController.updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { username, email, password, role } = req.body;

         if (!mongoose.Types.ObjectId) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }
 
        const user = await User.findById(id);
        if (!user) {
            const error = new Error('User not found');
            error.status = 404;
            return next(error);
        }

       
        if (username) user.username = username;
        if (email) user.email = email;
        if (password) user.password = await bcrypt.hash(password, 10);
        if (role) user.role = role;

        const updatedUser = await user.save();
        res.json({ success: true, data: updatedUser });
    } catch (err) {
        next(err);
    }
};

module.exports = userController;
