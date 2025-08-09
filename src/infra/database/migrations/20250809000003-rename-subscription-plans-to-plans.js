'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Renomear a tabela subscription_plans para plans
    await queryInterface.renameTable('subscription_plans', 'plans');
  },

  async down(queryInterface, Sequelize) {
    // Reverter: renomear de volta para subscription_plans
    await queryInterface.renameTable('plans', 'subscription_plans');
  }
};
