'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('results_keys', 'initial_value', {
      type: Sequelize.BIGINT,
      allowNull: false,
      defaultValue: 0
    });
    await queryInterface.changeColumn('results_keys', 'target_value', {
      type: Sequelize.BIGINT,
      allowNull: false
    });
    await queryInterface.changeColumn('results_keys', 'current_value', {
      type: Sequelize.BIGINT,
      allowNull: false,
      defaultValue: 0
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('results_keys', 'initial_value', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
    await queryInterface.changeColumn('results_keys', 'target_value', {
      type: Sequelize.INTEGER,
      allowNull: false
    });
    await queryInterface.changeColumn('results_keys', 'current_value', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    });
  }
};
