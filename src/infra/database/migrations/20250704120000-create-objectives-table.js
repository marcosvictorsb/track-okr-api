'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('objectives', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      id_team: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'teams',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      status: {
        type: Sequelize.ENUM('active', 'cancelled', 'completed'),
        allowNull: false,
        defaultValue: 'active'
      },
      quarter: {
        type: Sequelize.INTEGER,
        allowNull: false,
        validate: {
          min: 1,
          max: 4
        }
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: false
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

    // Adicionando índice para id_team para melhorar performance nas consultas
    await queryInterface.addIndex('objectives', ['id_team']);
    
    // Adicionando índice composto para quarter e year
    await queryInterface.addIndex('objectives', ['quarter', 'year']);
    
    // Adicionando índice para status
    await queryInterface.addIndex('objectives', ['status']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('objectives');
  }
};
