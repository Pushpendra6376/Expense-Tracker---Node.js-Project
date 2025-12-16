const jwt = require("jsonwebtoken");
const User = require("../models/user"); // Import User model

exports.authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
            return res.status(401).json({ message: "Access Denied: No Token Provided" });
        }

        const token = authHeader.split(" ")[1];
        if (!token) {
            return res.status(401).json({ message: "Access Denied: Token Malformed" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // [UPDATED] Fetch fresh user data from DB to get current premium status
        const user = await User.findByPk(decoded.userId);
        
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        req.user = {
            userId: user.id,
            email: user.email,
            isPremium: user.isPremium, // Fresh status from DB
        };

        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: "Invalid or Expired Token" });
    }
};