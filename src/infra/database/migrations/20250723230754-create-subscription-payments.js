'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subscription_payments', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      id_subscription: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'subscriptions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
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
      efi_charge_id: {
        type: Sequelize.STRING,
        allowNull: true,
        unique: true,
        comment: 'ID da cobrança na Efí Pay'
      },
      efi_subscription_id: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'ID da assinatura na Efí Pay'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Valor do pagamento em centavos'
      },
      status: {
        type: Sequelize.ENUM(
          'pending',
          'paid',
          'cancelled',
          'expired',
          'refunded'
        ),
        allowNull: false,
        defaultValue: 'pending'
      },
      payment_method: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: 'Método de pagamento (pix, boleto, cartao)'
      },
      due_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data de vencimento'
      },
      paid_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data do pagamento'
      },
      payment_link: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Link de pagamento gerado pela Efí'
      },
      webhook_data: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Dados do webhook da Efí'
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
    await queryInterface.addIndex('subscription_payments', ['id_subscription']);
    await queryInterface.addIndex('subscription_payments', ['id_company']);
    await queryInterface.addIndex('subscription_payments', ['efi_charge_id']);
    await queryInterface.addIndex('subscription_payments', ['status']);
    await queryInterface.addIndex('subscription_payments', ['due_date']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('subscription_payments');
  }
};
