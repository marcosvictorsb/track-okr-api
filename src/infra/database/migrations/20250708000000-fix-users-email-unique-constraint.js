'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, _Sequelize) {
  // Remover o índice único existente de email
  await queryInterface.removeIndex('users', 'users_email_unique');

  // Criar novo índice único composto por email + id_company
  await queryInterface.addIndex('users', ['email', 'id_company'], {
    name: 'users_email_company_unique',
    unique: true,
    where: {
      deleted_at: null
    }
  });
}

export async function down(queryInterface, _Sequelize) {
  // Remover o índice composto
  await queryInterface.removeIndex('users', 'users_email_company_unique');

  // Recriar o índice único simples (rollback)
  await queryInterface.addIndex('users', ['email'], {
    name: 'users_email_unique',
    unique: true,
    where: {
      deleted_at: null
    }
  });
}
