const Sequelize = require("sequelize");
const sequelize = require("../utils/db-collection");
const User = require("./user");

const DownloadedReport = sequelize.define("DownloadedReport", {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    fileUrl: {
        type: Sequelize.STRING,
        allowNull: false
    },
    fileName: {
        type: Sequelize.STRING,
        allowNull: false
    },
    userId: {                     
        type: Sequelize.INTEGER,
        allowNull: false
    }
});

User.hasMany(DownloadedReport, { foreignKey: "userId" });
DownloadedReport.belongsTo(User, { foreignKey: "userId" });

module.exports = DownloadedReport;
