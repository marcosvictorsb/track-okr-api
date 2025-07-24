'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('subscription_plans', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: 'Nome do plano (Ex: Básico, Pro, Enterprise)'
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: 'Descrição detalhada do plano'
      },
      max_users: {
        type: Sequelize.INTEGER,
        allowNull: false,
        comment: 'Número máximo de usuários permitidos'
      },
      price_monthly: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: false,
        comment: 'Preço mensal em centavos'
      },
      price_yearly: {
        type: Sequelize.DECIMAL(10, 2),
        allowNull: true,
        comment: 'Preço anual em centavos (com desconto)'
      },
      features: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Lista de funcionalidades do plano'
      },
      efi_plan_id: {
        type: Sequelize.STRING,
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
    await queryInterface.addIndex('subscription_plans', ['is_active']);
    await queryInterface.addIndex('subscription_plans', ['efi_plan_id']);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('subscription_plans');
  }
};
