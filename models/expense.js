const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db-collection");
const User = require("./user");

const Expense = sequelize.define("Expense", {
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    description: {
        type: DataTypes.STRING,
        allowNull: false
    },
    category: {
        type: DataTypes.STRING,
        allowNull: false
    }
});

// Expense belongs to a User
User.hasMany(Expense);
Expense.belongsTo(User);

module.exports = Expense;
