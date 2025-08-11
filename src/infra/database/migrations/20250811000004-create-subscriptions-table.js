'use strict';

// eslint-disable-next-line no-undef
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subscriptions', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      company_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Empresa proprietária da subscription'
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
        comment: 'Plano atual da subscription'
      },
      status: {
        type: Sequelize.ENUM(
          'trial',
          'active',
          'canceled',
          'expired',
          'suspended',
          'pending_activation'
        ),
        allowNull: false,
        defaultValue: 'trial',
        comment: 'Status atual da subscription'
      },
      trial_start_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data de início do trial'
      },
      trial_end_date: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data de fim do trial'
      },
      started_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW,
        comment: 'Data de início da subscription'
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data de expiração da subscription'
      },
      canceled_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data de cancelamento'
      },
      suspended_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data de suspensão (falta de pagamento)'
      },
      grace_period_ends_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Fim do período de carência após vencimento'
      },
      auto_renew: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Se a subscription renova automaticamente'
      },
      cancellation_reason: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Motivo do cancelamento'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Usuário que criou a subscription'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Observações administrativas'
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
    await queryInterface.addIndex('subscriptions', ['company_id']);
    await queryInterface.addIndex('subscriptions', ['plan_id']);
    await queryInterface.addIndex('subscriptions', ['status']);
    await queryInterface.addIndex('subscriptions', ['expires_at']);
    await queryInterface.addIndex('subscriptions', ['trial_end_date']);
    await queryInterface.addIndex('subscriptions', ['company_id', 'status'], {
      name: 'idx_subscriptions_company_status'
    });
    await queryInterface.addIndex('subscriptions', ['status', 'expires_at'], {
      name: 'idx_subscriptions_status_expires'
    });
  },

  async down(queryInterface, _Sequelize) {
    // Remove índices primeiro
    await queryInterface.removeIndex(
      'subscriptions',
      'idx_subscriptions_status_expires'
    );
    await queryInterface.removeIndex(
      'subscriptions',
      'idx_subscriptions_company_status'
    );
    await queryInterface.removeIndex('subscriptions', ['trial_end_date']);
    await queryInterface.removeIndex('subscriptions', ['expires_at']);
    await queryInterface.removeIndex('subscriptions', ['status']);
    await queryInterface.removeIndex('subscriptions', ['plan_id']);
    await queryInterface.removeIndex('subscriptions', ['company_id']);

    // Remove a tabela
    await queryInterface.dropTable('subscriptions');
  }
};
