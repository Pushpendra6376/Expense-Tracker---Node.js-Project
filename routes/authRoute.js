const express = require("express");
const router = express.Router();
const authController = require('../controllers/authController');


// to create an user in our db 
router.post('/signup', authController.signUp);

// to login the user 
router.post('/login', authController.login);

module.exports = router;