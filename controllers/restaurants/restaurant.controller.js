const Restaurant = require("../../models/restaurant.model");
// const ArchivedRestaurant = require("../../models/archivedRestaurant.model");

const restaurantController = {};


// restaurantController.createArchivedRestaurant = async (req, res, next) => {
//     try {
//         const { website, telephone, name, email } = req.body;

//         // Check if a restaurant with the same email already exists
//         const existingResto = await ArchivedRestaurant.findOne({ email });
//         console.log('archived resto', existingResto)
//         if (existingResto) {
//             return res.status(400).json({ success: false, message: 'Restaurant with this email already exists.' });
//         }

//         // Create a new archived restaurant with visibility set to 'no show'
//         const newRestaurant = new ArchivedRestaurant({
//             website,
//             telephone,
//             name,
//             email,
//             visibility: 'no show'  // Setting visibility to 'no show'
//         });

//         // Save the new archived restaurant to the database
//         const archivedRestaurants = await newRestaurant.save();
//         res.status(201).json({ success: true, data: archivedRestaurants });
//     } catch (err) {
//         console.error('Error while creating archived restaurant:', err);
//         res.status(500).json({ error: 'Something went wrong while archiving the restaurant.' });
//     }
// };

restaurantController.getRestaurant = async (req, res) => {
    try {
        console.log('Fetching visible restaurants');
        // Fetch only restaurants with visibility set to "show"
        const restaurants = await Restaurant.find({ visibility: "show" });
        console.log('Visible restaurants:', restaurants);

        res.status(200).json(restaurants);
    } catch (error) {
        res.json({ error: 'Failed to fetch visible restaurants' });
    }
};

restaurantController.getArchivedRestaurants = async (req,res) => {
    try {
        console.log('Fetching archived restaurants');
        // Fetch only restaurants with visibility set to "no show"
        const archivedRestaurants = await Restaurant.find({ visibility: "no show" });
        console.log('Archived restaurants:', archivedRestaurants);
        res.status(200).json(archivedRestaurants);
    } catch (error) {
        res.json({ error: 'Failed to fetch archived restaurants' });
    }
};
restaurantController.archiveRestaurant = async (req, res, next) => {
    try {
        const { id } = req.params;

        const foundRestaurant = await Restaurant.findById(id);
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

restaurantController.createRestaurant = async (req, res, next) => {
    try {
        const { website, name, telephone, email } = req.body;
        const existingResto = await Restaurant.findOne({ email });

        if (existingResto) {
            return res.json({ success: false, message: 'Restaurant with this email already exists.' });
        }
        const newRestaurant = new Restaurant({
            website,
            name,
            telephone,
            email,


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
