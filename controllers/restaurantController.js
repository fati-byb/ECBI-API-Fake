const Restaurant = require('../models/Restaurant');

// Ajouter un restaurant
exports.addRestaurant = async (req, res) => {
    try {
        const { website, reservation, menu, owner, phone, email } = req.body;

        const newRestaurant = new Restaurant({
           
            website,
            reservation,
            menu,
            owner,
            phone,
            email
        });

        const savedRestaurant = await newRestaurant.save();
        res.status(201).json({ message: 'Restaurant ajouté avec succès!', restaurant: savedRestaurant });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de l\'ajout', error });
    }
};

//modifier
exports.updateRestaurant = async (req, res) => {
    const { id } = req.params;  // Ensure this matches what is being sent
    const updateData = req.body;
  
    try {
      const restaurant = await Restaurant.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
  
      if (!restaurant) {
        return res.json({ message: 'Restaurant not found' });
      }
  
      res.status(200).json(restaurant);  // Return updated restaurant
    } catch (error) {
      res.json({ message: error.message });
    }
  };
  
  


// // Obtenir un restaurant par ID
// exports.getRestaurantById = async (req, res) => {
//     try {
//         const { id } = req.params;
//         const cleanedId = id.trim();

//         if (!mongoose.Types.ObjectId.isValid(cleanedId)) {
//             return res.status(400).json({ message: 'ID invalide' });
//         }

//         const restaurant = await Restaurant.findById(cleanedId);

//         if (!restaurant) {
//             return res.status(404).json({ message: 'Restaurant non trouvé' });
//         }

//         res.json(restaurant);
//     } catch (error) {
//         res.status(500).json({ message: 'Erreur lors de la récupération du restaurant', error });
//     }
// };
