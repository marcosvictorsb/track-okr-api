'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'landing_page_leads',
      'site',
      {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Site informado pelo lead'
      },
      {
        after: 'position' // Garante a ordem da coluna
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('landing_page_leads', 'site');
  }
};
