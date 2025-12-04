const jwt = require("jsonwebtoken");

exports.authenticate = (req, res, next) => {
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
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            isPremium: decoded.isPremium || false,
        };

        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: "Invalid or Expired Token" });
    }
};
