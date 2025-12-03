const jwt = require("jsonwebtoken");


// jwt authentication for our user and also Bearer token
exports.authenticate = (req, res, next) => {
    try {
        const token = req.headers['authorization']?.split(" ")[1]; 

        if (!token) {
            return res.status(401).json({ message: "Access Denied: No Token Provided" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            isPremium: decoded.isPremium || false,
        };   

        next();

    } catch (error) {
        return res.status(401).json({ message: "Invalid or Expired Token" });
    }
};