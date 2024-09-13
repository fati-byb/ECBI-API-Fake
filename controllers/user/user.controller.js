const User = require('../../models/user.model');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const userController = {};

const PointDeVente = require('../../models/pointdevente.model');

userController.createUser = async (req, res, next) => {
    try {
        const { email, password, pointOfSale, role, telephone, username } = req.body;

         const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: 'User with this email already exists.' });
        }

         const pointDeVenteId = pointOfSale[0]; // Assuming pointOfSale is an array with the PointDeVente IDs
        console.log('pointDeVenteId:', pointDeVenteId);

        const pointDeVente = await PointDeVente.findById(pointDeVenteId);
        if (!pointDeVente) {
            return res.json({ success: false, message: 'Point of sale not found.' });
        }

        // Create a new user with the PointDeVenteId
        const newUser = new User({
            username,
            email,
            telephone,
            password,
            role,
            pointOfSale: [pointDeVente._id] // Add the PointDeVente ID to the user's array of pointOfSale
        });

        const savedUser = await newUser.save();
        res.json({ success: true, data: savedUser });
    } catch (error) {
        console.log('Error creating user:', error);
        res.status(500).json({ success: false, message: 'Failed to create user' });
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
