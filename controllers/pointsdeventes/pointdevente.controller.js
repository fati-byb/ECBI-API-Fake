const PointDeVente = require("../../models/pointdevente.model");

const pointDeVenteController = {};



pointDeVenteController.getRestaurant = async (req, res) => {
    try {
        console.log('Fetching visible restaurants');
        // Fetch only restaurants with visibility set to "show"
        const restaurants = await PointDeVente.find({ visibility: "show" });
        console.log('Visible restaurants:', restaurants);

        res.status(200).json(restaurants);
    } catch (error) {
        res.json({ error: 'Failed to fetch visible restaurants' });
    }
};

pointDeVenteController.getArchivedRestaurants = async (req,res) => {
    try {
        console.log('Fetching archived restaurants');
        // Fetch only restaurants with visibility set to "no show"
        const archivedRestaurants = await PointDeVente.find({ visibility: "no show" });
        console.log('Archived restaurants:', archivedRestaurants);
        res.status(200).json(archivedRestaurants);
    } catch (error) {
        res.json({ error: 'Failed to fetch archived restaurants' });
    }
};
pointDeVenteController.archiveRestaurant = async (req, res, next) => {
    try {
        const { id } = req.params;

        const foundRestaurant = await PointDeVente.findById(id);
        console.log('resto to update', foundRestaurant)
        if (!foundRestaurant) {
            return res.json({ message: 'Restaurant not found' });
        }

        // Update visibility to false
        foundRestaurant.visibility = 'no show'; // or false if you use boolean
        await foundRestaurant.save();

        return res.status(200).json({ message: 'Restaurant archived successfully', data: foundRestaurant });
    } catch (err) {
        next(err);
    }
};

pointDeVenteController.unarchiveRestaurant = async (req, res, next) => {
    try {
        const { id } = req.params;

        const foundRestaurant = await PointDeVente.findById(id);
        console.log('resto to update', foundRestaurant)
        if (!foundRestaurant) {
            return res.json({ message: 'Restaurant not found' });
        }

        // Update visibility to false
        foundRestaurant.visibility = 'show'; // or false if you use boolean
        await foundRestaurant.save();

        return res.status(200).json({ message: 'Restaurant unarchived successfully', data: foundRestaurant });
    } catch (err) {
        next(err);
    }
};

pointDeVenteController.createRestaurant = async (req, res, next) => {
    try {
        const { website, name, directeur } = req.body;

        const { username, email, telephone } = directeur[0];        
        const existingResto = await PointDeVente.findOne({email});

        if (existingResto) {
            return res.json({ success: false, message: 'Restaurant with this email already exists.' });
        }
        const newRestaurant = new PointDeVente({
            website,
            name,
            directeur:[
                {
                    username, 
                    telephone,
                    email
                }
            ]
            


        });

        const restaurant = await newRestaurant.save();
        res.json({ success: true, data: restaurant });
    } catch (err) {
        console.log('something went very wrong');
        res.json({ error: 'Failed to create restaurant' });
    }
};

// Mettre à jour un restaurant
pointDeVenteController.updateRestaurant = async (req, res) => {
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

module.exports = pointDeVenteController;
