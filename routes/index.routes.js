// routes/index.js
const router = require('express').Router();
const passport = require('passport');

// Import user and restaurant routes
const userRoutes = require('./users.routes');
const pointsDeVentesRoutes = require('./pointsdeventes.routes');
const User = require('../models/user.model');
// const User = require('../models/user.model');

// Public routes
router.use('/users', userRoutes);
router.use('/pointDeVente', pointsDeVentesRoutes);

router.post('/auth', require('../controllers/user/auth.controller').login);


router.get('/editEnable/:id', async (req, res) => {
        try {
            const { id } = req.params;
            
            // Find the user by ID
            const user = await User.findById(id);
            
            // If the user does not exist, return an error response
            if (!user) {
                return res.status(404).json({ message: "User does not exist" });
            }
    
            // Update the 'enabled' field
            user.enabled = true;
    
            // Save the updated user to the database
            await user.save();
    
            // Return a success response
            return res.status(200).json({ message: "User enabled successfully", user });
        } catch (error) {
            // Handle any errors that occur
            return res.status(500).json({ message: "Server error", error });
        }
    });
// 
// Authentication route

router.all('*', (req, res, next) => {
    passport.authenticate('jwt', { session: false }, (err, user) => {
        if (err || !user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        req.user = user;
        next();
    })(req, res, next);
});
//protected routes

module.exports = router;