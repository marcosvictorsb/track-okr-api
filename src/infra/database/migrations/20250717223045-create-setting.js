'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('settings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      block_okr_creation: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      block_key_result_creation: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      block_okr_editing: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      block_key_result_editing: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      allowed_quarters: {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [1, 2, 3, 4]
      },
      current_quarter_only: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false
      },
      id_company: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Adicionar índice para id_company para melhor performance
    await queryInterface.addIndex('settings', ['id_company']);
  },

  async down(queryInterface) {
    await queryInterface.dropTable('settings');
  }
};
