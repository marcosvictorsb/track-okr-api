'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Verificar se a tabela existe antes de tentar deletar
    const tables = await queryInterface.showAllTables();

    if (tables.includes('subscription_plans_temp')) {
      // Deletar a tabela subscription_plans_temp
      await queryInterface.dropTable('subscription_plans_temp');
    }
  },

  async down(queryInterface, Sequelize) {
    // Recriar a tabela subscription_plans_temp
    // Esta era uma tabela temporária, então criar estrutura básica
    await queryInterface.createTable('subscription_plans_temp', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true
      },
      efi_plan_id: {
        type: Sequelize.STRING(100),
        allowNull: true,
        unique: true
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      interval: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      repeats: {
        type: Sequelize.INTEGER,
        allowNull: true
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
  }
};
