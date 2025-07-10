'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('result_key_updates', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      id_result_key: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: 'results_keys',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      previous_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Valor anterior do resultado-chave'
      },
      new_value: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Novo valor do resultado-chave'
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Comentário sobre a atualização'
      },
      id_user: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Usuário que fez a atualização'
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

    // Índice para buscar atualizações por resultado-chave
    await queryInterface.addIndex('result_key_updates', ['id_result_key']);

    // Índice para buscar atualizações por usuário
    await queryInterface.addIndex('result_key_updates', ['id_user']);

    // Índice composto para buscar atualizações por resultado-chave e data
    await queryInterface.addIndex('result_key_updates', [
      'id_result_key',
      'created_at'
    ]);

    // Índice para buscar por data de criação (para relatórios)
    await queryInterface.addIndex('result_key_updates', ['created_at']);
  },

  async down(queryInterface) {
    // Remover os índices primeiro
    await queryInterface.removeIndex('result_key_updates', ['created_at']);
    await queryInterface.removeIndex('result_key_updates', [
      'id_result_key',
      'created_at'
    ]);
    await queryInterface.removeIndex('result_key_updates', ['id_user']);
    await queryInterface.removeIndex('result_key_updates', ['id_result_key']);

    // Remover a tabela
    await queryInterface.dropTable('result_key_updates');
  }
};
