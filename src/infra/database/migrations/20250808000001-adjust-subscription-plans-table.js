'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remover colunas que não estão no model
    await queryInterface.removeColumn('subscription_plans', 'max_users');
    await queryInterface.removeColumn('subscription_plans', 'price_monthly');
    await queryInterface.removeColumn('subscription_plans', 'price_yearly');
    await queryInterface.removeColumn('subscription_plans', 'features');

    // Adicionar novas colunas do model
    await queryInterface.addColumn('subscription_plans', 'interval', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Intervalo do plano (dias, meses, etc.)'
    });

    await queryInterface.addColumn('subscription_plans', 'repeats', {
      type: Sequelize.INTEGER,
      allowNull: true,
      comment: 'Número de repetições do plano (null = infinito)'
    });

    // Ajustar o tamanho da coluna name para VARCHAR(100) como no model
    await queryInterface.changeColumn('subscription_plans', 'name', {
      type: Sequelize.STRING(100),
      allowNull: false,
      comment: 'Nome do plano (Ex: Básico, Pro, Enterprise)'
    });

    // Ajustar o tamanho da coluna efi_plan_id para VARCHAR(100) como no model
    await queryInterface.changeColumn('subscription_plans', 'efi_plan_id', {
      type: Sequelize.STRING(100),
      allowNull: true,
      unique: true,
      comment: 'ID do plano na Efí Pay'
    });

    // Adicionar índice para a coluna name como no model
    await queryInterface.addIndex('subscription_plans', ['name']);
  },

  async down(queryInterface, Sequelize) {
    // Reverter as mudanças - adicionar de volta as colunas removidas
    await queryInterface.addColumn('subscription_plans', 'max_users', {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
      comment: 'Número máximo de usuários permitidos'
    });

    await queryInterface.addColumn('subscription_plans', 'price_monthly', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      comment: 'Preço mensal em centavos'
    });

    await queryInterface.addColumn('subscription_plans', 'price_yearly', {
      type: Sequelize.DECIMAL(10, 2),
      allowNull: true,
      comment: 'Preço anual em centavos (com desconto)'
    });

    await queryInterface.addColumn('subscription_plans', 'features', {
      type: Sequelize.JSON,
      allowNull: true,
      comment: 'Lista de funcionalidades do plano'
    });

    // Remover as colunas adicionadas
    await queryInterface.removeColumn('subscription_plans', 'interval');
    await queryInterface.removeColumn('subscription_plans', 'repeats');

    // Reverter mudanças nas colunas
    await queryInterface.changeColumn('subscription_plans', 'name', {
      type: Sequelize.STRING,
      allowNull: false,
      comment: 'Nome do plano (Ex: Básico, Pro, Enterprise)'
    });

    await queryInterface.changeColumn('subscription_plans', 'efi_plan_id', {
      type: Sequelize.STRING,
      allowNull: true,
      unique: true,
      comment: 'ID do plano na Efí Pay'
    });

    // Remover o índice da coluna name
    await queryInterface.removeIndex('subscription_plans', ['name']);
  }
};
