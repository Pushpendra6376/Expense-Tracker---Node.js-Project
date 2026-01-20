'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    const expenses = [];

    const users = await queryInterface.sequelize.query(
      `SELECT id FROM Users`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    for (const user of users) {
      for (let i = 1; i <= 500; i++) {
        expenses.push({
          amount: Math.floor(Math.random() * 5000) + 100,
          description: `Expense ${i}`,
          category: ["Food", "Travel", "Shopping", "Bills"][i % 4],
          userId: user.id,
          createdAt: new Date(),
          updatedAt: new Date()
        });
      }
    }

    const CHUNK_SIZE = 2000;
    for (let i = 0; i < expenses.length; i += CHUNK_SIZE) {
      await queryInterface.bulkInsert(
        "Expenses",
        expenses.slice(i, i + CHUNK_SIZE)
      );
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Expenses", null, {});
  }
};
