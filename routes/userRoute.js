const express = require("express");
const { authenticate } = require("../middlewares/authMiddleware");
const User = require("../models/user");
const router = express.Router();

router.get("/me", authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.userId, {
            attributes: ["id", "username", "email", "isPremium"]
        });

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json({ user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch user" });
    }
});


module.exports = router;