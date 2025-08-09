'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar se a tabela existe antes de tentar deletar
    const tables = await queryInterface.showAllTables();

    if (tables.includes('subscriptions')) {
      // Primeiro, remover foreign keys de outras tabelas que referenciam subscriptions
      if (tables.includes('subscription_payments')) {
        try {
          await queryInterface.removeConstraint(
            'subscription_payments',
            'subscription_payments_ibfk_1'
          );
        } catch (error) {
          // Constraint pode não existir, ignorar erro
        }

        try {
          await queryInterface.removeConstraint(
            'subscription_payments',
            'subscription_payments_subscription_id_foreign'
          );
        } catch (error) {
          // Constraint pode não existir, ignorar erro
        }
      }

      // Remover índices primeiro (se existirem)
      try {
        await queryInterface.removeIndex(
          'subscriptions',
          'subscriptions_id_company_index'
        );
      } catch (error) {
        // Índice pode não existir, ignorar erro
      }

      try {
        await queryInterface.removeIndex(
          'subscriptions',
          'subscriptions_status_index'
        );
      } catch (error) {
        // Índice pode não existir, ignorar erro
      }

      try {
        await queryInterface.removeIndex(
          'subscriptions',
          'subscriptions_id_external_payment_unique'
        );
      } catch (error) {
        // Índice pode não existir, ignorar erro
      }

      try {
        await queryInterface.removeIndex(
          'subscriptions',
          'subscriptions_subscription_plan_id_foreign_idx'
        );
      } catch (error) {
        // Índice pode não existir, ignorar erro
      }

      // Deletar a tabela
      await queryInterface.dropTable('subscriptions');
    }
  },

  async down(queryInterface, Sequelize) {
    // Recriar a tabela subscriptions conforme estava na migration original
    await queryInterface.createTable('subscriptions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      amount_users: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'active'
      },
      id_company: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
      },
      id_external_payment: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },
      subscription_plan_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'plans',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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

    // Recriar índices
    await queryInterface.addIndex('subscriptions', ['id_company'], {
      name: 'subscriptions_id_company_index'
    });

    await queryInterface.addIndex('subscriptions', ['status'], {
      name: 'subscriptions_status_index'
    });

    await queryInterface.addIndex('subscriptions', ['id_external_payment'], {
      name: 'subscriptions_id_external_payment_unique',
      unique: true
    });

    await queryInterface.addIndex('subscriptions', ['subscription_plan_id'], {
      name: 'subscriptions_subscription_plan_id_foreign_idx'
    });
  }
};
