'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.addColumn('landing_page_leads', 'phone', {
    type: Sequelize.STRING(20),
    allowNull: true,
    comment: 'Telefone do lead',
    after: 'company' // MySQL específico - adiciona após a coluna company
  });

  // Adicionar índice para busca por telefone
  await queryInterface.addIndex('landing_page_leads', ['phone'], {
    name: 'landing_page_leads_phone_idx'
  });
}

export async function down(queryInterface, _Sequelize) {
  // Remover índice primeiro
  await queryInterface.removeIndex(
    'landing_page_leads',
    'landing_page_leads_phone_idx'
  );

  // Remover coluna
  await queryInterface.removeColumn('landing_page_leads', 'phone');
}
