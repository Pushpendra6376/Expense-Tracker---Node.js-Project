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
    },
    note: {
        type: DataTypes.STRING,
        allowNull: true
    }
});

// Expense belongs to a User
User.hasMany(Expense, { foreignKey: 'userId' });
Expense.belongsTo(User, { foreignKey: 'userId' });

module.exports = Expense;
