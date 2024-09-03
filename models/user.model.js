const mongoose = require('mongoose'), 
    bcrypt = require('bcryptjs'), 
    hash = require('../config/hash')
;


const UserSchema = mongoose.Schema({

    username: {
        type: String,
        lowercase: true
    },

    email: {
        type: String,
        lowercase: true,
        unique: true,
        required: [true, "can't be blank"],
        match: [/\S+@\S+\.\S+/, 'is invalid'],
        username: {
            type: String,
            lowercase: true
        },  index: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ['SUPER_ADMIN', 'SOUS_ADMIN','FINAL_USER'],
        default: 'ROLE_USER'
    },

    resetPasswordToken: {
        type: String
    },

    resetPasswordExpires: {
        type: Date
    },

    activationCode: {
        type: String
    },

    activationCodeExpires: {
        type: Date
    },

    enabled: {
        type: Boolean,
        default: false
    }
});

UserSchema.pre('save', async function(next) {

    try {
        if (this.isModified('password')) {
            this.password = await hash(this.password);
        }

        next();

    } catch (e) {
        return next(e);
    }

});
// Compare password
UserSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (err) {
        throw new Error('Password comparison failed');
    }
};




UserSchema.methods.toJSON = function() {
    const userObject = this.toObject();

    delete userObject.password;
    delete userObject.resetPasswordExpires;
    delete userObject.resetPasswordToken;
    delete userObject.activationCode;
    delete userObject.activationCodeExpires;

    return userObject;
}

UserSchema.post('save', function(error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        const item =  error.message.split(':')[2].split(' ')[1].split('_')[0]; 
        let message = 'duplicate email';
        let code = undefined;

        switch (item) {
            case 'email':
                code = 'USER_AUTH_DUPLICATE_EMAIL'
                break;
        
            default:
                break;
        }
        let err = new Error(message)
        if(code){
         err = new Error(JSON.stringify({message, code_error: code}))
        }
        next(err);
    } else {
      next(error);
    }
  });

const User = mongoose.model('User', UserSchema);

module.exports = User;