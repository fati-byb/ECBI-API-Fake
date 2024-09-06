
const mongoose = require('mongoose');
const ArchivedRestaurant = require("../../models/archivedRestaurant.model");

const archivedRestaurantController = {};


archivedRestaurantController.getArchivedRestaurant = async (req, res) => { // Corrected order of req, res
    try {
        
        const archivedResaurant = await ArchivedRestaurant.find(); 
        console.log('restoo', archivedResaurant)
        // Fetch all restaurants from the database
        res.status(200).json(archivedResaurant);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch archived restaurants' });
    }
};

archivedRestaurantController.createArchivedRestaurant = async (req, res, next) => {
    try {
       
        const {  website, phone, name, email } = req.body;
    
        const existingResto = await ArchivedRestaurant.findOne({ email });

        if (existingResto) {
            return res.status(400).json({ success: false, message: 'Restaurant with this email already exists.' });
        }
        const newRestaurant = new ArchivedRestaurant({
            
            website,
            phone,
            name,
            email,
          
           
        });

        const archivedRestaurants = await newRestaurant.save();
        res.status(201).json({ success: true, data: archivedRestaurants });
    } catch (err) {
        console.log('something went very wrong');
    }
};

module.exports= archivedRestaurantController;