const router = require('express').Router();
const passport = require('passport');
const indexController = require('../controllers/index.controller');
const userController = require('../controllers/user.controller');
const authController = require('../controllers/auth.controller');

// const User = require('../models/user.model');

 router.get('/', indexController.index );
 router.post('/auth', authController.login);

router.post('/users', userController.createUser)
// router.get('/user/verify/:id', async (req, res, next)=>{
//         const {id}= req.params;
//         const user = await User.findById(id)
//         user.enabled=true 
//         await user.save()
//         res.json({user})
// })

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
router.put('/users/:id',userController.updateUser);  


module.exports = router;
