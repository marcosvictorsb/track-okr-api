'use strict';

/* eslint-disable no-undef */
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('results_keys', {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nome do resultado-chave'
      },
      initial_value: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Valor inicial do resultado-chave'
      },
      target_value: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Valor alvo do resultado-chave'
      },
      current_value: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Valor atual do resultado-chave'
      },
      unit: {
        type: Sequelize.STRING(10),
        allowNull: false,
        comment: 'Unidade de medida (%, $, unidades, etc.)'
      },
      responsible_users: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Array com IDs dos usuários responsáveis'
      },
      responsible_team_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'teams',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'ID do time responsável'
      },
      id_okr: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'objectives',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'ID do objetivo (OKR) ao qual este resultado-chave pertence'
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'active',
        comment: 'Status do resultado-chave: active, completed, cancelled'
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: true
      },
      deleted_at: {
        type: Sequelize.DATE,
        allowNull: true
      }
    });

    // Adicionando índices para melhorar performance
    await queryInterface.addIndex('results_keys', ['responsible_team_id']);
    await queryInterface.addIndex('results_keys', ['id_okr']);
    await queryInterface.addIndex('results_keys', ['status']);

    // Índice composto para buscas por objetivo e status
    await queryInterface.addIndex('results_keys', ['id_okr', 'status']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('results_keys');
  }
};
