'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subscriptions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },

      // Dados da assinatura na Efi
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

      // Relacionamento com plano local (contém efi_plan_id, interval, repeats)
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

      // Dados da cobrança
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

      // Dados do pagamento
      payment_method: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: 'Método de pagamento (credit_card, boleto, pix, etc.)'
      },

      // Dados da execução
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

      // Relacionamento com empresa
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

      // Timestamps
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
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('subscriptions');
  }
};
