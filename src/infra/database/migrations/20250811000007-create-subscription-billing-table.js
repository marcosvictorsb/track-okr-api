'use strict';

// eslint-disable-next-line no-undef
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subscription_billing', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      subscription_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: 'subscriptions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Subscription relacionada (1:1)'
      },
      billing_cycle: {
        type: Sequelize.ENUM('monthly', 'quarterly', 'annual'),
        allowNull: false,
        defaultValue: 'monthly',
        comment: 'Ciclo de cobrança'
      },
      amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Valor da cobrança em centavos'
      },
      currency: {
        type: Sequelize.STRING(3),
        allowNull: false,
        defaultValue: 'BRL',
        comment: 'Moeda (ISO 4217)'
      },
      discount_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        defaultValue: 0.0,
        comment: 'Valor do desconto aplicado'
      },
      discount_percentage: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: true,
        comment: 'Percentual de desconto'
      },
      discount_expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data de expiração do desconto'
      },
      tax_rate: {
        type: Sequelize.DECIMAL(5, 2),
        allowNull: false,
        defaultValue: 0.0,
        comment: 'Taxa de impostos (%)'
      },
      tax_amount: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.0,
        comment: 'Valor dos impostos'
      },
      next_billing_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Próxima data de cobrança'
      },
      last_billing_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Última data de cobrança'
      },
      last_successful_payment_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data do último pagamento bem-sucedido'
      },
      failed_payment_attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Tentativas de pagamento falhadas'
      },
      max_failed_attempts: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 3,
        comment: 'Máximo de tentativas antes de suspender'
      },
      payment_method: {
        type: Sequelize.ENUM(
          'credit_card',
          'debit_card',
          'pix',
          'bank_slip',
          'bank_transfer'
        ),
        allowNull: true,
        comment: 'Método de pagamento preferido'
      },
      billing_email: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Email para envio de faturas'
      },
      billing_address: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Endereço de cobrança (JSON)'
      },
      invoice_notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Observações para aparecer na fatura'
      },
      auto_retry_failed_payments: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Se deve tentar novamente pagamentos falhados'
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

    // Índices para performance
    await queryInterface.addIndex('subscription_billing', ['subscription_id']);
    await queryInterface.addIndex('subscription_billing', [
      'next_billing_date'
    ]);
    await queryInterface.addIndex('subscription_billing', ['billing_cycle']);
    await queryInterface.addIndex('subscription_billing', ['payment_method']);
    await queryInterface.addIndex('subscription_billing', [
      'failed_payment_attempts'
    ]);
    await queryInterface.addIndex(
      'subscription_billing',
      ['next_billing_date', 'billing_cycle'],
      {
        name: 'idx_subscription_billing_schedule'
      }
    );
  },

  async down(queryInterface, _Sequelize) {
    // Remove índices primeiro
    await queryInterface.removeIndex(
      'subscription_billing',
      'idx_subscription_billing_schedule'
    );
    await queryInterface.removeIndex('subscription_billing', [
      'failed_payment_attempts'
    ]);
    await queryInterface.removeIndex('subscription_billing', [
      'payment_method'
    ]);
    await queryInterface.removeIndex('subscription_billing', ['billing_cycle']);
    await queryInterface.removeIndex('subscription_billing', [
      'next_billing_date'
    ]);
    await queryInterface.removeIndex('subscription_billing', [
      'subscription_id'
    ]);

    // Remove a tabela
    await queryInterface.dropTable('subscription_billing');
  }
};
