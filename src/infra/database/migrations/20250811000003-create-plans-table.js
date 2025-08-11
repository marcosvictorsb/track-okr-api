'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('plans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nome do plano (Ex: Progresso, Performance, Customizado)'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descrição detalhada do plano'
      },
      max_users: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Quantidade máxima de usuários permitidos'
      },
      max_planners: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Quantidade máxima de planejamentos permitidos'
      },
      max_teams: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Quantidade máxima de times permitidos'
      },
      max_objectives_per_quarter: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Quantidade máxima de objetivos por trimestre'
      },
      max_key_results_per_objective: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Quantidade máxima de resultados-chave por objetivo'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: true,
        type: Sequelize.DATE
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE
      }
    });

    // Índices para otimização
    await queryInterface.addIndex('plans', ['name'], {
      name: 'plans_name_index'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('plans');
  }
};
