'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('subscriptions', 'trial_days', {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: null,
      comment: 'Número de dias de trial (1-365 dias)',
      validate: {
        min: 1,
        max: 365
      }
    });

    // Adicionar índice para otimizar consultas por trial_days
    await queryInterface.addIndex('subscriptions', ['trial_days'], {
      name: 'subscriptions_trial_days_index'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remover índice primeiro
    await queryInterface.removeIndex(
      'subscriptions',
      'subscriptions_trial_days_index'
    );

    // Remover a coluna
    await queryInterface.removeColumn('subscriptions', 'trial_days');
  }
};
