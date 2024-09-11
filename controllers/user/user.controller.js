const User = require('../../models/user.model');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userController = {};

// Création d'un utilisateur
userController.createUser = async (req, res, next) => {
    try {
        const { username, email, password, role } = req.body;

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            role
        });

        const user = await newUser.save();
        res.status(201).json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

// Mise à jour d'un utilisateur
userController.updateUser = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { username, email, password, role, enabled } = req.body;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: 'Invalid user ID' });
        }

        const user = await User.findById(id);
        if (!user) {
            const error = new Error('User not found');
            return next(error);
        }

        if (username) user.username = username;
        if (email) user.email = email;
        if (password) user.password = await bcrypt.hash(password, 10); // Hash password if provided
        if (role) user.role = role;
        if (enabled !== undefined) user.enabled = enabled; // Update enabled status

        const updatedUser = await user.save();
        res.json({ success: true, data: updatedUser });
    } catch (err) {
        next(err);
    }
};

// Activer un utilisateur
userController.activateUser = async (req, res, next) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.json({ success: false, message: 'Invalid user ID' });
        }

        const user = await User.findById(id);
        if (!user) {
            const error = new Error('User not found');
            return next(error);
        }

        // Set enabled to true
        user.enabled = true;
        await user.save();

        res.json({ success: true, data: user });
    } catch (err) {
        next(err);
    }
};

module.exports = userController;
