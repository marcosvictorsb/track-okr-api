'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Adicionar coluna subscription_plan_id na tabela subscriptions
    await queryInterface.addColumn('subscriptions', 'subscription_plan_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'subscription_plans',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Adicionar índice para melhor performance
    await queryInterface.addIndex('subscriptions', ['subscription_plan_id']);
  },

  async down(queryInterface, Sequelize) {
    // Remover índice
    await queryInterface.removeIndex('subscriptions', ['subscription_plan_id']);

    // Remover coluna
    await queryInterface.removeColumn('subscriptions', 'subscription_plan_id');
  }
};
