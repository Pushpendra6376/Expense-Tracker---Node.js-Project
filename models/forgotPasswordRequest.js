const { DataTypes } = require("sequelize");
const sequelize = require("../utils/db-collection");
const User = require("./user");

const ForgotPasswordRequest = sequelize.define("ForgotPasswordRequest", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  }
});

ForgotPasswordRequest.belongsTo(User, { foreignKey: "userId" });
User.hasMany(ForgotPasswordRequest, { foreignKey: "userId" });

module.exports = ForgotPasswordRequest;
