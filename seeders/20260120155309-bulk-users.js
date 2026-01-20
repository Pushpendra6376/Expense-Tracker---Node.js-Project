'use strict';
const bcrypt = require("bcrypt");

module.exports = {
  async up(queryInterface, Sequelize) {
    const users = [];
    const hashedPassword = await bcrypt.hash("123456", 10);

    for (let i = 1; i <= 1500; i++) {
      users.push({
        username: `user${i}`,
        email: `user${i}@test.com`,
        password: hashedPassword,
        isPremium: i % 10 === 0,
        createdAt: new Date(),
        updatedAt: new Date()
      });
    }

    await queryInterface.bulkInsert("Users", users);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("Users", null, {});
  }
};
