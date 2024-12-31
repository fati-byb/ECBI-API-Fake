const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const User = require('../models/user.model');

module.exports = (passport) => {
    const opts = {};
    opts.secretOrKey = process.env.JWT_SECRET;
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

    passport.use(new JwtStrategy(opts, async (jwtPayload, done) => {
        
        try {
            console.log(jwtPayload)
            const user = await User.findById(jwtPayload._id);
            console.log(user)
            
            if (user && user.enabled) {
                return done(null, user);
            }
            
            return done(null, false);
        } catch (err) {
            return done(err, false);
        }
    }));
};

 