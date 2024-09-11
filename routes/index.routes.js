const express = require('express');
const router = express.Router();

// Import user and restaurant routes
const userRoutes = require('./users.routes');
const restaurantRoutes = require('./restaurants.routes');

// Public routes
router.use('/users', userRoutes);
router.use('/restaurants', restaurantRoutes);

// Authentication route
router.post('/auth', require('../controllers/user/auth.controller').login);

// Protect routes with JWT authentication
router.all('*', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err || !user) {
            return res.json({ message: 'Unauthorized' });
        }
        req.user = user;
        next();
    })(req, res, next);
});

module.exports = router;
