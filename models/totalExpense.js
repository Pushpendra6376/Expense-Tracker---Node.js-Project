const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db-collection");
const User = require("./user");


const TotalExpense = sequelize.define("TotalExpense", {
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true
    },
    totalExpense: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    }
});

User.hasOne(TotalExpense, { foreignKey: "userId" });
TotalExpense.belongsTo(User, { foreignKey: "userId" });


module.exports = TotalExpense;
