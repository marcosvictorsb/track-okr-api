'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('companies', 'website', {
    type: Sequelize.STRING(500),
    allowNull: true,
    comment: 'Website da empresa',
    after: 'cnpj'
  });
}

export async function down(queryInterface) {
  await queryInterface.removeColumn('companies', 'website');
}
