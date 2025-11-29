const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db-collection");

const Payment = sequelize.define("Payment", {
    orderId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false
    },
    amount: {
        type: DataTypes.FLOAT,
        allowNull: false
    },
    status: {
        type: DataTypes.ENUM("PENDING", "SUCCESSFUL", "FAILED"),
        defaultValue: "PENDING"
    }
}, {
    timestamps: true
});

module.exports = Payment;
