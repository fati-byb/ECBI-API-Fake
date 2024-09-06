const mongoose = require('mongoose');

const restaurantSchema = new mongoose.Schema({
    
    website: { type: String, default: '' },
    reservation: { type: String, default: '' },
    menu: { type: String, default: '' },
    owner: { type: String, default: '' },
    phone: { type: String, default: '' },
    email: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Restaurant', restaurantSchema);

