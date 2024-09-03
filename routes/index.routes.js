const router = require('express').Router();
const passport = require('passport');
const indexController = require('../controllers/index.controller');
const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');

 router.get('/', indexController.index );
 router.post('/auth', authController.login);

router.post('/users', userController.createUser)
// router.use('/data', require('./data.routes'));


//Customize and Protect the routes
router.all('*', (req, res, next) => {
    passport.authenticate('jwt', {session: false}, (err, user) => {
        
        if(err || !user) {
            const error = new Error('Unauthorized !');
            error.status = 401;
            next(error);
        }
        req.user = user;
        return next();
    })(req, res, next);
});



//----------- Protected Routes -----------//

//router.use('/users', require('./users.routes'));
router.put('/users/:id', userController.updateUser); // Updated route


module.exports = router;
