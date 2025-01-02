const jwt = require('jsonwebtoken');
const User = require('../../models/user.model');

const authController = {};

// authController.login = async (req, res, next) => {
//     try {
//         const { email, password } = req.body;

//         console.log("Login request received with email:", email); // Debug
//         const user = await User.findOne({ email })
//             .populate('pointOfSale'); // Populates pointOfSale field

//         if (!user) {
//             console.log("No user found with email:", email); // Debug
//             return res.json({ message: "Unauthorized: Invalid email" });
//         }

//         console.log("User found:", user); // Debug

//         // Compare passwords
//         const isPasswordValid = await user.comparePassword(password);
//         if (!isPasswordValid) {
//             console.log("Password is invalid for email:", email); // Debug
//             return res.json({ message: "Unauthorized: Invalid password" });
//         }

//         console.log("Password validated for email:", email); // Debug

//         // Extract necessary data
//         const role = user.role;
//         const pointOfSaleName = user.pointOfSale?.name || null; // Assuming 'name' is a field in PointDeVente

//         // Generate JWT token
//         const token = jwt.sign(
//             { _id: user._id, email: user.email, pointOfSaleName, role }, // Include pointOfSaleName in the token payload
//             process.env.JWT_SECRET,
//             { expiresIn: process.env.JWT_EXPIRATION }
//         );

//         res.json({ success: true, token, role, pointOfSaleName });
//     } catch (err) {
//         console.error("Error during login:", err);
//         return res.json({ message: "Internal Server Error" });
//     }
// };

// authController.login = async (req, res, next) => {
//     try {
//         const { emailOrPhone, password } = req.body;
    
//         // Recherche par email ou téléphone
//         const user = await User.findOne({
//             $or: [
//                 { telephone: emailOrPhone },
//                 { email: emailOrPhone }
//             ]
//         }).populate('pointOfSale');

//         if (!user) {
//             return res.json({ message: "Unauthorized: Invalid email or phone" });
//         }

//         // Vérification du mot de passe
//         const isPasswordValid = await user.comparePassword(password);
//         if (!isPasswordValid) {
//             return res.json({ message: "Unauthorized: Invalid password" });
//         }
//           // Compare passwords
      
//         // Génération du token JWT
//         const role = user.role;
//         const pointOfSaleName = user.pointOfSale?.name || null;
//         const token = jwt.sign(
//             { 
//                 _id: user._id, 
//                 email: user.email, 
//                 telephone: user.telephone, // Ajout du champ téléphone
//                 pointOfSaleName, 
//                 role 
//             },
//             process.env.JWT_SECRET,
//             { expiresIn: process.env.JWT_EXPIRATION }
//         );

//         // Réponse au client
//         res.json({ success: true, token, role, pointOfSaleName, telephone: user.telephone });
//     } catch (err) {
//         console.error("Error during login:", err);
//         return res.json({ message: "Internal Server Error" });
//     }
// };

authController.login = async (req, res, next) => {
    try {
        const { emailOrPhone, password } = req.body;

        // Recherche par email ou téléphone
        const user = await User.findOne({
            $or: [
                { telephone: emailOrPhone },
                { email: emailOrPhone }
            ]
        }).populate('pointOfSale');

        if (!user) {
            return res.json({ message: "Unauthorized: Invalid email or phone" });
        }

        // Vérification du mot de passe
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.json({ message: "Unauthorized: Invalid password" });
        }

        // Génération du token JWT
        const role = user.role;
        const pointOfSaleName = user.pointOfSale?.name || null;
        const token = jwt.sign(
            { 
                _id: user._id, 
                email: user.email, 
                telephone: user.telephone,
                username: user.username, // Ajout du champ username
                pointOfSaleName, 
                role 
            },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        // Réponse au client avec les informations supplémentaires
        res.json({ 
            success: true, 
            token, 
            role, 
            pointOfSaleName, 
            email: user.email, 
            telephone: user.telephone, 
            username: user.username // Ajout à la réponse
        });
    } catch (err) {
        console.error("Error during login:", err);
        return res.json({ message: "Internal Server Error" });
    }
};



module.exports = authController;