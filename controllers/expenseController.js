const Expense = require("../models/expense");
const { fn, col } = require("sequelize");
const User = require("../models/user");

//Adding expense
exports.addExpense = async (req, res) => {
    try {
        const { amount, description, category } = req.body;

        const expense = await Expense.create({
            amount,
            description,
            category,
            userId: req.user.userId  // from jwt middleware
        });

        return res.status(201).json({ message:"Expense Added", expense });

    } catch (error) {
        res.status(500).json({ error: "Something went wrong!" });
    }
};

// fetching expense for a perticular user
exports.getExpenses = async (req,res)=>{
    try{
        const expenses = await Expense.findAll({ where:{ userId: req.user.userId }});

        return res.status(200).json({ expenses });

    }catch(err){
        res.status(500).json({ error:"Failed to fetch expenses"});
    }
};


// deleting the expense
exports.deleteExpenseById = async (req,res) =>{
    try {
        const expenseId = req.params.id;  

        // check if expense exists for logged-in user only
        const deleted = await Expense.destroy({
            where: { id: expenseId, userId: req.user.userId }
        });

        if(!deleted){
            return res.status(404).json({message:"Expense not found or unauthorized"});
        }

        return res.status(200).json({message:"Expense deleted successfully"});
        
    } catch (error) {
        res.status(500).json({error:"Something went wrong while deleting expense"});
    }
};


exports.getLeaderboard = async (req, res) => {
    try {
        const leaderboard = await User.findAll({
            attributes: [
                "id",
                "username",
                [fn("SUM", col("Expenses.amount")), "totalExpense"]
            ],
            include: [
                {
                    model: Expense,
                    attributes: []
                }
            ],
            group: ["User.id"],
            order: [[fn("SUM", col("Expenses.amount")), "DESC"]]
        });

        return res.status(200).json({ leaderboard });

    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Failed to fetch leaderboard" });
    }
};