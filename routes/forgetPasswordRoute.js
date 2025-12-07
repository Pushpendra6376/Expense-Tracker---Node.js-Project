const express = require("express");
const router = express.Router();

const { forgotPassword, resetPassword, verifyRequestAndServeForm } = require("../controllers/forgetPasswordController");

router.post("/forgotpassword", forgotPassword);
router.post("/resetpassword/:id", resetPassword);
router.get("/resetpassword/:id", verifyRequestAndServeForm);
module.exports = router;
