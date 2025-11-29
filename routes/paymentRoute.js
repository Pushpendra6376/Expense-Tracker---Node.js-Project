const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/authMiddleware");
const paymentController = require("../controllers/paymentController");

router.post("/order", authenticate, paymentController.createOrder);
router.get("/verify", authenticate, paymentController.verifyPayment);

module.exports = router;
