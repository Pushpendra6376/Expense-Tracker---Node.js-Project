const express = require("express");
const router = express.Router();
const authController = require('../controllers/authController');

// to create an user in our db 
router.post('/signup', authController.createUser);

// to login the user 
router.post('/login', authController.verifyUser);

module.exports = router;