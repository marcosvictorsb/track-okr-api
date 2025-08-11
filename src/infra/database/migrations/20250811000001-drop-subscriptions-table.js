'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar se a tabela existe antes de tentar deletar
    const tables = await queryInterface.showAllTables();

    if (tables.includes('subscriptions')) {
      // Remover índices primeiro (se existirem)
      try {
        await queryInterface.removeIndex(
          'subscriptions',
          'subscriptions_efi_subscription_id_unique'
        );
      } catch (error) {
        // Índice pode não existir, ignorar erro
      }

      try {
        await queryInterface.removeIndex(
          'subscriptions',
          'subscriptions_company_id_index'
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
          'subscriptions_plan_id_index'
        );
      } catch (error) {
        // Índice pode não existir, ignorar erro
      }

      try {
        await queryInterface.removeIndex(
          'subscriptions',
          'subscriptions_trial_days_index'
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
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      efi_subscription_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        comment: 'ID da assinatura na Efi Pay'
      },
      status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Status da assinatura (active, canceled, etc.)'
      },
      plan_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'plans',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Referência ao plano local'
      },
      efi_charge_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'ID da transação na Efi Pay'
      },
      charge_status: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Status da cobrança (waiting, paid, etc.)'
      },
      charge_parcel: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 1,
        comment: 'Número de parcelas'
      },
      charge_total: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Valor total em centavos'
      },
      payment_method: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Método de pagamento (credit_card, boleto, pix, etc.)'
      },
      first_execution: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: 'Data da primeira execução da assinatura'
      },
      total: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Valor total da assinatura em centavos'
      },
      company_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT',
        comment: 'Empresa proprietária da assinatura'
      },
      trial_days: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: null,
        comment: 'Número de dias de trial (1-365 dias)'
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
    await queryInterface.addIndex('subscriptions', ['efi_subscription_id'], {
      unique: true,
      name: 'subscriptions_efi_subscription_id_unique'
    });

    await queryInterface.addIndex('subscriptions', ['company_id'], {
      name: 'subscriptions_company_id_index'
    });

    await queryInterface.addIndex('subscriptions', ['status'], {
      name: 'subscriptions_status_index'
    });

    await queryInterface.addIndex('subscriptions', ['plan_id'], {
      name: 'subscriptions_plan_id_index'
    });

    await queryInterface.addIndex('subscriptions', ['trial_days'], {
      name: 'subscriptions_trial_days_index'
    });
  }
};
