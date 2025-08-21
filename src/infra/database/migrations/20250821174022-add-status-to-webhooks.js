'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('webhooks', 'status', {
      type: Sequelize.STRING(20),
      allowNull: false,
      defaultValue: 'pending',
      comment:
        'Status do processamento do webhook (pending, processed, failed, ignored)',
      after: 'json'
    });

    // Adicionar índice para a nova coluna status
    await queryInterface.addIndex('webhooks', ['status']);

    // Adicionar índice composto para consultas combinadas
    await queryInterface.addIndex('webhooks', ['source', 'status']);
  },

  async down(queryInterface, Sequelize) {
    // Remover índices primeiro
    await queryInterface.removeIndex('webhooks', ['status']);
    await queryInterface.removeIndex('webhooks', ['source', 'status']);

    // Remover a coluna
    await queryInterface.removeColumn('webhooks', 'status');
  }
};
