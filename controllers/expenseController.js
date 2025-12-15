const Expense = require("../models/expense");
const User = require("../models/user");
const TotalExpense = require("../models/totalExpense");
const { predictCategory } = require("../services/geminiService");
const sequelize = require("../utils/db-collection");
const { Op } = require("sequelize"); // [Fix: Import Op]

// ... existing addExpense ...
exports.addExpense = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const { amount, description, category, note } = req.body;

        let finalCategory = category;

        if (!finalCategory || finalCategory === "" || finalCategory === "Select Category") {
            finalCategory = await predictCategory(description);
        }

        const expense = await Expense.create({
            amount,
            description,
            category: finalCategory,
            note: note || null,
            userId: req.user.userId
        }, { transaction: t });

        // Updating total expense
        const total = await TotalExpense.findOne({ where: { userId: req.user.userId }, transaction: t });
        if (total) {
            total.totalExpense = Number(total.totalExpense) + Number(amount);
            await total.save({ transaction: t });
        } else {
            await TotalExpense.create({
                userId: req.user.userId,
                totalExpense: Number(amount)
            }, { transaction: t });
        }

        await t.commit();
        return res.status(201).json({ message: "Expense Added", expense });

    } catch (error) {
        await t.rollback();
        res.status(500).json({ error: "Something went wrong!" });
    }
};

// ... existing getExpenses ...
exports.getExpenses = async (req, res) => {
    try {
        const page = Number(req.query.page) || 1;
        const limit = Number(req.query.limit) || 10;
        const offset = (page - 1) * limit;

        const result = await Expense.findAndCountAll({
            where: { userId: req.user.userId },
            limit,
            offset,
            order: [["createdAt", "DESC"]],
        });

        res.status(200).json({
            expenses: result.rows,
            totalItems: result.count,
            currentPage: page,
            hasNextPage: limit * page < result.count,
            hasPreviousPage: page > 1,
            nextPage: page + 1,
            previousPage: page - 1,
            lastPage: Math.ceil(result.count / limit),
        });
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch expenses" });
    }
};

// ... existing deleteExpenseById ...
exports.deleteExpenseById = async (req, res) => {
    const t = await sequelize.transaction();
    try {
        const expenseId = req.params.id;

        const expense = await Expense.findOne({
            where: { id: expenseId, userId: req.user.userId },
            transaction: t
        });

        if (!expense) {
            await t.rollback();
            return res.status(404).json({ message: "Expense not found or unauthorized" });
        }

        await expense.destroy({ transaction: t });

        const total = await TotalExpense.findOne({ where: { userId: req.user.userId }, transaction: t });
        if (total) {
            total.totalExpense = Number(total.totalExpense) - Number(expense.amount);
            await total.save({ transaction: t });
        }

        await t.commit();
        return res.status(200).json({ message: "Expense deleted successfully" });

    } catch (error) {
        await t.rollback();
        res.status(500).json({ error: "Something went wrong while deleting expense" });
    }
};

// ... existing getLeaderboard ...
exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await User.findAll({
            attributes: ["id", "username"],
            include: [
                {
                    model: TotalExpense,
                    attributes: ["totalExpense"]
                }
            ],
            order: [[TotalExpense, "totalExpense", "DESC"]]
        });

        return res.status(200).json({ leaderboard });

    } catch (error) {
        res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
};

// [Fix: New method for Report Data]
exports.getExpensesForReport = async (req, res) => {
    try {
        const { month } = req.query; // Expected format: YYYY-MM
        let whereClause = { userId: req.user.userId };

        if (month) {
            const start = new Date(month + "-01");
            const end = new Date(month + "-01");
            end.setMonth(end.getMonth() + 1);

            whereClause.createdAt = {
                [Op.gte]: start,
                [Op.lt]: end
            };
        }

        const expenses = await Expense.findAll({
            where: whereClause,
            order: [["createdAt", "ASC"]] // Chronological order for reports
        });

        res.status(200).json({ expenses });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Failed to fetch report data" });
    }
};