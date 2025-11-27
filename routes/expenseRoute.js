const express = require("express");
const { authenticate } = require("../middlewares/authMiddleware");
const expenseController = require('../controllers/expenseController');
const router = express.Router();

router.post("/add-expense", authenticate, addExpense);
router.get("/expenses", authenticate, getExpenses);
router.delete("/delete/:id", authenticate, deleteExpenseById);

module.exports = router;