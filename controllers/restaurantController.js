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
    try {
        const { id } = req.params;
        const { website, reservation, menu, owner, phone, email } = req.body;

        const updatedRestaurant = await Restaurant.findByIdAndUpdate(
            id,
            { website, reservation, menu, owner, phone, email },
            { new: true }
        );

        if (!updatedRestaurant) {
            return res.status(404).json({ message: 'Restaurant non trouvé' });
        }

        res.status(200).json(updatedRestaurant);
    } catch (error) {
        console.error('Erreur lors de la mise à jour du restaurant:', error.message);
        res.status(500).json({ message: 'Erreur lors de la mise à jour', error });
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
