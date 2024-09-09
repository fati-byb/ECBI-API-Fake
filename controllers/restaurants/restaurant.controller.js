const mongoose = require('mongoose');
const Restaurant = require("../../models/restaurant.model");

const restaurantController = {};

// Récupérer tous les restaurants
restaurantController.getRestaurant = async (req, res) => { 
    try {
        console.log('almost there');
        const restaurants = await Restaurant.find(); 
        console.log('restoo', restaurants);
        // Fetch all restaurants from the database
        res.status(200).json(restaurants);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch restaurants' });
    }
};

// Supprimer un restaurant
restaurantController.deleteRestaurant = async (req, res, next) => {
    try {
        const { id } = req.params;

        const foundRestaurant = await Restaurant.findById(id);

        if (!foundRestaurant) {
            return res.json({ message: 'Restaurant not found' });
        }

        await Restaurant.findByIdAndDelete(id);

        return res.status(200).json({ message: 'Restaurant deleted successfully' });
    } catch (err) {
        next(err);
    }
};

// Créer un nouveau restaurant
restaurantController.createRestaurant = async (req, res, next) => {
    try {
        const { website, phone, owner, email, reservation, menu, state, visibility } = req.body;
        const existingResto = await Restaurant.findOne({ email });

        if (existingResto) {
            return res.json({ success: false, message: 'Restaurant with this email already exists.' });
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
        res.json({ success: true, data: restaurant });
    } catch (err) {
        console.log('something went very wrong');
        res.json({ error: 'Failed to create restaurant' });
    }
};

// Mettre à jour un restaurant
restaurantController.updateRestaurant = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
  
    try {
      // Find the restaurant by ID and update it
      const restaurant = await Restaurant.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  
      if (!restaurant) {
        return res.json({ message: 'Restaurant not found' });
      }
  
      // Send the updated restaurant data back to the client
      res.status(200).json(restaurant);
    } catch (error) {
      // Handle errors
      res.json({ message: error.message });
    }
};

module.exports = restaurantController;
