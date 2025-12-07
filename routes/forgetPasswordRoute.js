const express = require("express");
const router = express.Router();

const { forgotPassword } = require("../controllers/forgetPasswordController");

router.post("/forgotpassword", forgotPassword);

module.exports = router;
