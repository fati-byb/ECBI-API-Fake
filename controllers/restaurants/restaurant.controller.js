const mongoose = require('mongoose');
const Restaurant = require("../../models/restaurant.model");

const restaurantController = {};

restaurantController.getRestaurant = async (req, res) => { // Corrected order of req, res
    try {
        console.log('almost there')
        const restaurants = await Restaurant.find(); 
        console.log('restoo', restaurants)
        // Fetch all restaurants from the database
        res.status(200).json(restaurants);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch restaurants' });
    }
};
restaurantController.deleteRestaurant = async (req, res, next) => {
    try {
        const { id } = req.params;

        
        const foundRestaurant = await Restaurant.findById(id);

        if (!foundRestaurant) {
            return res.status(404).json({ message: 'Restaurant not found' });
        }

        
        await Restaurant.findByIdAndDelete(id);

        return res.status(200).json({ message: 'Restaurant deleted successfully' });
    } catch (err) {
        next(err);
    }
};
restaurantController.createRestaurant = async (req, res, next) => {
    try {
        const {  website, phone, owner, email, reservation, menu, state, visibility } = req.body;
        const existingResto = await Restaurant.findOne({ email });

        if (existingResto) {
            return res.status(400).json({ success: false, message: 'Restaurant with this email already exists.' });
        }
        const newRestaurant = new Restaurant({
            
            website,
            phone,
            owner,
            email,
            reservation,
            menu,
            state,
            visibility
        });

        const restaurant = await newRestaurant.save();
        res.status(201).json({ success: true, data: restaurant });
    } catch (err) {
        console.log('something went very wrong');
    }
};

module.exports = restaurantController;
