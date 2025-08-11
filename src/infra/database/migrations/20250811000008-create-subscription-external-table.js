'use strict';

// eslint-disable-next-line no-undef
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subscription_external', {
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
      external_provider: {
        type: Sequelize.ENUM(
          'cakto',
          'efi',
          'stripe',
          'pagarme',
          'mercadopago'
        ),
        allowNull: false,
        comment: 'Provedor de pagamento externo'
      },
      external_subscription_id: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'ID da subscription no provedor externo'
      },
      external_customer_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'ID do cliente no provedor externo'
      },
      external_plan_id: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'ID do plano no provedor externo'
      },
      external_status: {
        type: Sequelize.STRING(100),
        allowNull: true,
        comment: 'Status da subscription no provedor externo'
      },
      webhook_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
        comment: 'URL do webhook configurada no provedor'
      },
      webhook_secret: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Secret para validação de webhooks'
      },
      webhook_events: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Eventos do webhook que estamos escutando'
      },
      api_credentials: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Credenciais de API (criptografadas)'
      },
      last_sync_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Última sincronização com o provedor'
      },
      last_webhook_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Último webhook recebido'
      },
      sync_status: {
        type: Sequelize.ENUM(
          'pending',
          'syncing',
          'synced',
          'error',
          'manual_required'
        ),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Status da sincronização'
      },
      sync_error_message: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Mensagem de erro da última sincronização'
      },
      sync_retry_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de tentativas de sincronização'
      },
      max_sync_retries: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 5,
        comment: 'Máximo de tentativas de sincronização'
      },
      metadata: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Dados adicionais específicos do provedor'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Se a integração está ativa'
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

    // Índices para performance e integrações
    await queryInterface.addIndex('subscription_external', ['subscription_id']);
    await queryInterface.addIndex('subscription_external', [
      'external_provider'
    ]);
    await queryInterface.addIndex('subscription_external', [
      'external_subscription_id'
    ]);
    await queryInterface.addIndex('subscription_external', [
      'external_customer_id'
    ]);
    await queryInterface.addIndex('subscription_external', ['sync_status']);
    await queryInterface.addIndex('subscription_external', ['is_active']);
    await queryInterface.addIndex('subscription_external', ['last_sync_at']);

    // Índices compostos para consultas específicas
    await queryInterface.addIndex(
      'subscription_external',
      ['external_provider', 'external_subscription_id'],
      {
        unique: true,
        name: 'idx_subscription_external_provider_unique'
      }
    );
    await queryInterface.addIndex(
      'subscription_external',
      ['subscription_id', 'external_provider'],
      {
        name: 'idx_subscription_external_sub_provider'
      }
    );
    await queryInterface.addIndex(
      'subscription_external',
      ['sync_status', 'last_sync_at'],
      {
        name: 'idx_subscription_external_sync'
      }
    );
  },

  async down(queryInterface, _Sequelize) {
    // Remove índices primeiro
    await queryInterface.removeIndex(
      'subscription_external',
      'idx_subscription_external_sync'
    );
    await queryInterface.removeIndex(
      'subscription_external',
      'idx_subscription_external_sub_provider'
    );
    await queryInterface.removeIndex(
      'subscription_external',
      'idx_subscription_external_provider_unique'
    );
    await queryInterface.removeIndex('subscription_external', ['last_sync_at']);
    await queryInterface.removeIndex('subscription_external', ['is_active']);
    await queryInterface.removeIndex('subscription_external', ['sync_status']);
    await queryInterface.removeIndex('subscription_external', [
      'external_customer_id'
    ]);
    await queryInterface.removeIndex('subscription_external', [
      'external_subscription_id'
    ]);
    await queryInterface.removeIndex('subscription_external', [
      'external_provider'
    ]);
    await queryInterface.removeIndex('subscription_external', [
      'subscription_id'
    ]);

    // Remove a tabela
    await queryInterface.dropTable('subscription_external');
  }
};
