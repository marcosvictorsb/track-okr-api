'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar se a tabela existe antes de tentar deletar
    const tables = await queryInterface.showAllTables();

    if (tables.includes('plans')) {
      // Remover índices primeiro (se existirem)
      try {
        await queryInterface.removeIndex('plans', 'plans_name_idx');
      } catch (error) {
        // Índice pode não existir, ignorar erro
      }

      try {
        await queryInterface.removeIndex('plans', 'plans_is_active_idx');
      } catch (error) {
        // Índice pode não existir, ignorar erro
      }

      try {
        await queryInterface.removeIndex('plans', 'plans_efi_plan_id_unique');
      } catch (error) {
        // Índice pode não existir, ignorar erro
      }

      // Tentar remover outros possíveis índices
      try {
        await queryInterface.removeIndex('plans', ['name']);
      } catch (error) {
        // Índice pode não existir, ignorar erro
      }

      try {
        await queryInterface.removeIndex('plans', ['is_active']);
      } catch (error) {
        // Índice pode não existir, ignorar erro
      }

      try {
        await queryInterface.removeIndex('plans', ['efi_plan_id']);
      } catch (error) {
        // Índice pode não existir, ignorar erro
      }

      // Deletar a tabela
      await queryInterface.dropTable('plans');
    }
  },

  async down(queryInterface, Sequelize) {
    // Recriar a tabela plans conforme estava na migration original
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
        comment: 'Nome do plano'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descrição detalhada do plano'
      },
      efi_plan_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true,
        comment: 'ID do plano na Efí Pay'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Se o plano está ativo para novas assinaturas'
      },
      interval: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Intervalo do plano em dias'
      },
      repeats: {
        type: Sequelize.INTEGER,
        allowNull: true,
        comment: 'Número de repetições do plano (null = infinito)'
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

    // Recriar índices
    await queryInterface.addIndex('plans', ['name'], {
      name: 'plans_name_idx',
      unique: false
    });

    await queryInterface.addIndex('plans', ['is_active'], {
      name: 'plans_is_active_idx',
      unique: false
    });

    await queryInterface.addIndex('plans', ['efi_plan_id'], {
      name: 'plans_efi_plan_id_unique',
      unique: true
    });
  }
};
