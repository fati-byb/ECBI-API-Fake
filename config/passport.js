const JwtStategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;

const User = require('../models/user.model');

module.exports = (passport) => {
    let config = {};
    config.secretOrKey = process.env.JWT_SECRET;
    config.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();

    //get user object from JWT token 
    passport.use(new JwtStategy(config, async (jwtPayload, done) => {
        try{
            // find user from DB by id
            const user = await User.findById(jwtPayload._id);
            
            if(user && user.enabled){
                return done(null, user);
            }
                return done(null, false);
        }catch(e){return done(e, false);}
    }));
}