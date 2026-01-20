'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      UPDATE TotalExpenses te
      JOIN (
        SELECT userId, SUM(amount) AS total
        FROM Expenses
        GROUP BY userId
      ) e ON te.userId = e.userId
      SET te.totalExpense = e.total
    `);
  },

  async down(queryInterface, Sequelize) {}
};
