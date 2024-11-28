const jwt = require('jsonwebtoken');
const User = require('../../models/user.model');

const authController = {};

// authController.login = async (req, res, next) => {
//     try {
//         const { email, password } = req.body;
//         const user = await User.findOne({ email });
   
//         // user.password= password
//         // user.save()
//         // return 
    
         
//          if (!user || !(await user.comparePassword(password))) {
//             console.log('hashed pass', comparePassword(password))
//             const error = new Error('Invalid email or password');
           
//             return next(error);
//         }

//         // Generate JWT token
//         const role= user.role;
//         const token = jwt.sign(
//             { _id: user._id, email: user.email },
//             process.env.JWT_SECRET,
//             { expiresIn: process.env.JWT_EXPIRATION }
//         );

//         res.json({ success: true, token, role});
//     } catch (err) {
//         console.log('we could not login ');
//     }
// };
authController.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;

        console.log("Login request received with email:", email); // Debug
        const user = await User.findOne({ email });

        if (!user) {
            console.log("No user found with email:", email); // Debug
            return res.status(401).json({ message: "Unauthorized: Invalid email" });
        }

        console.log("User found:", user); // Debug

        // Compare passwords
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            console.log("Password is invalid for email:", email); // Debug
            return res.status(401).json({ message: "Unauthorized: Invalid password" });
        }

        console.log("Password validated for email:", email); // Debug

        // Generate JWT token
        const role = user.role;
        const token = jwt.sign(
            { _id: user._id, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRATION }
        );

        res.json({ success: true, token, role });
    } catch (err) {
        console.error("Error ioioioiduring login:", err);
        return res.status(500).json({ message: "Internal Server Errorttt" });
    }
};

module.exports = authController;
