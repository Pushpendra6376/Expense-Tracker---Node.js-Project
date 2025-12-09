module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn("expenses", "note", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn("expenses", "note");
  }
};
