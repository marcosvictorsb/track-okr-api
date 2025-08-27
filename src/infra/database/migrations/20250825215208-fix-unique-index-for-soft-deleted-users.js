'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Remover índice único atual que não considera deleted_at
    await queryInterface.removeIndex('users', 'users_email_company_unique');

    // Criar novo índice único que considera apenas registros não deletados
    await queryInterface.addIndex('users', ['email', 'id_company'], {
      name: 'users_email_company_unique',
      unique: true,
      where: {
        deleted_at: null
      }
    });
  },

  async down(queryInterface, Sequelize) {
    // Reverter para o índice único original
    await queryInterface.removeIndex('users', 'users_email_company_unique');
    await queryInterface.addIndex('users', ['email', 'id_company'], {
      name: 'users_email_company_unique',
      unique: true
    });
  }
};
