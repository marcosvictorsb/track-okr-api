'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('companies', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    cnpj: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    deleted_at: {
      type: Sequelize.DATE,
      allowNull: true
    }
  });

  // Adicionando índice único para CNPJ
  await queryInterface.addIndex('companies', ['cnpj'], {
    name: 'companies_cnpj_unique',
    unique: true,
    where: {
      deleted_at: null
    }
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('companies');
}