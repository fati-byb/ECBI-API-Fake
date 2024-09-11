const express = require('express');
const router = express.Router();

// Import user and restaurant routes
const userRoutes = require('./users.routes');
const pointsDeVentesRoutes = require('./pointsdeventes.routes');
const User = require('../models/user.model');
// const User = require('../models/user.model');

// Public routes
router.use('/users', userRoutes);

router.use('/pointDeVente', pointsDeVentesRoutes);

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
