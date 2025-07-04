'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('user_teams', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      id_user: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
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
      role_in_team: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'member',
        comment: 'Papel do usuário no time: leader, member, etc.'
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

    // Índice único para evitar duplicatas de usuário no mesmo time ativo
    await queryInterface.addIndex('user_teams', ['id_user', 'id_team'], {
      unique: true,
      where: {
        deleted_at: null
      },
      name: 'unique_active_user_team'
    });

    // Índices para melhorar performance
    await queryInterface.addIndex('user_teams', ['id_user'], {
      name: 'idx_user_teams_user'
    });

    await queryInterface.addIndex('user_teams', ['id_team'], {
      name: 'idx_user_teams_team'
    });
  },

  async down(queryInterface, _Sequelize) {
    // Remover índices primeiro
    await queryInterface.removeIndex('user_teams', 'unique_active_user_team');
    await queryInterface.removeIndex('user_teams', 'idx_user_teams_user');
    await queryInterface.removeIndex('user_teams', 'idx_user_teams_team');

    // Remover a tabela
    await queryInterface.dropTable('user_teams');
  }
};
