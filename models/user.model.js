const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Fonction pour hacher les mots de passe
const hashPassword = async (password) => {
    return bcrypt.hash(password, 10);
};

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
        index: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ['SUPER_ADMIN', 'SOUS_ADMIN', 'FINAL_USER'],
        default: 'FINAL_USER'
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

// Hash le mot de passe avant de sauvegarder l'utilisateur
UserSchema.pre('save', async function (next) {
    try {
        if (this.isModified('password')) {
            this.password = await hashPassword(this.password);
        }
        next();
    } catch (e) {
        return next(e);
    }
});

// Compare les mots de passe
UserSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

// Méthode pour activer l'utilisateur
UserSchema.methods.activate = async function () {
    this.enabled = true;
    return this.save();
};

// Exclure les champs sensibles de la réponse JSON
UserSchema.methods.toJSON = function () {
    const userObject = this.toObject();
    delete userObject.password;
    delete userObject.resetPasswordExpires;
    delete userObject.resetPasswordToken;
    delete userObject.activationCode;
    delete userObject.activationCodeExpires;
    return userObject;
};

// Gérer les erreurs de duplication d'email
UserSchema.post('save', function (error, doc, next) {
    if (error.name === 'MongoError' && error.code === 11000) {
        const item = error.message.split(':')[2].split(' ')[1].split('_')[0]; 
        let message = 'Duplicate email';
        let code = undefined;

        if (item === 'email') {
            code = 'USER_AUTH_DUPLICATE_EMAIL';
        }

        let err = new Error(message);
        if (code) {
            err = new Error(JSON.stringify({ message, code_error: code }));
        }
        next(err);
    } else {
        next(error);
    }
});

const User = mongoose.model('User', UserSchema);

module.exports = User;
