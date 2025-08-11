'use strict';

// eslint-disable-next-line no-undef
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subscription_history', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      subscription_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'subscriptions',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
        comment: 'Subscription relacionada'
      },
      action: {
        type: Sequelize.ENUM(
          'created',
          'activated',
          'upgraded',
          'downgraded',
          'renewed',
          'canceled',
          'expired',
          'suspended',
          'reactivated',
          'trial_started',
          'trial_extended',
          'trial_converted',
          'plan_changed',
          'limits_updated'
        ),
        allowNull: false,
        comment: 'Ação realizada na subscription'
      },
      previous_status: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Status anterior'
      },
      new_status: {
        type: Sequelize.STRING(50),
        allowNull: true,
        comment: 'Novo status'
      },
      previous_plan_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'plans',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Plano anterior'
      },
      new_plan_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'plans',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Novo plano'
      },
      reason: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'Motivo da mudança'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Dados adicionais da mudança (valores anteriores, etc.)'
      },
      ip_address: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: 'IP de onde partiu a ação'
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'User agent do navegador'
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
        comment: 'Usuário que executou a ação'
      },
      automated: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: 'Se a ação foi automatizada (sistema)'
      },
      notes: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Observações sobre a mudança'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }
    });

    // Índices para performance e auditoria
    await queryInterface.addIndex('subscription_history', ['subscription_id']);
    await queryInterface.addIndex('subscription_history', ['action']);
    await queryInterface.addIndex('subscription_history', ['created_by']);
    await queryInterface.addIndex('subscription_history', ['created_at']);
    await queryInterface.addIndex('subscription_history', ['automated']);
    await queryInterface.addIndex(
      'subscription_history',
      ['subscription_id', 'created_at'],
      {
        name: 'idx_subscription_history_timeline'
      }
    );
    await queryInterface.addIndex(
      'subscription_history',
      ['subscription_id', 'action'],
      {
        name: 'idx_subscription_history_action'
      }
    );
  },

  async down(queryInterface, _Sequelize) {
    // Remove índices primeiro
    await queryInterface.removeIndex(
      'subscription_history',
      'idx_subscription_history_action'
    );
    await queryInterface.removeIndex(
      'subscription_history',
      'idx_subscription_history_timeline'
    );
    await queryInterface.removeIndex('subscription_history', ['automated']);
    await queryInterface.removeIndex('subscription_history', ['created_at']);
    await queryInterface.removeIndex('subscription_history', ['created_by']);
    await queryInterface.removeIndex('subscription_history', ['action']);
    await queryInterface.removeIndex('subscription_history', [
      'subscription_id'
    ]);

    // Remove a tabela
    await queryInterface.dropTable('subscription_history');
  }
};
