'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Alter table commands to change column type from FLOAT to DECIMAL(10,2)
     */
    
    // 1. Update Expenses Table
    await queryInterface.changeColumn('Expenses', 'amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    });

    // 2. Update Payments Table
    await queryInterface.changeColumn('Payments', 'amount', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false
    });
  },

  async down (queryInterface, Sequelize) {
    /**
     * Revert commands (Wapas purani state me lane ke liye)
     */
     
    // Revert Expenses Table to FLOAT
    await queryInterface.changeColumn('Expenses', 'amount', {
      type: Sequelize.FLOAT,
      allowNull: false
    });

    // Revert Payments Table to FLOAT
    await queryInterface.changeColumn('Payments', 'amount', {
      type: Sequelize.FLOAT,
      allowNull: false
    });
  }
};