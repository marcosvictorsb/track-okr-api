'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('webhooks', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      source: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Fonte do webhook (ex: cakto, mercadopago, stripe, etc)'
      },
      description: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Descrição do webhook ou evento'
      },
      json: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: 'Payload JSON completo do webhook'
      },
      created: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        comment: 'Data e hora de criação do registro'
      }
    });

    // Adicionar índices para melhor performance
    await queryInterface.addIndex('webhooks', ['source']);
    await queryInterface.addIndex('webhooks', ['created']);
    await queryInterface.addIndex('webhooks', ['source', 'created']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('webhooks');
  }
};
