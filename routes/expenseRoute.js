const express = require("express");
const { authenticate } = require("../middlewares/authMiddleware");
const expenseController = require('../controllers/expenseController');
const router = express.Router();

router.post("", authenticate, expenseController.addExpense);
router.get("/", authenticate, expenseController.getExpenses);
router.delete("/delete/:id", authenticate, expenseController.deleteExpenseById);

module.exports = router;