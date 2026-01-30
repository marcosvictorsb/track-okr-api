'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('companies', 'cnpj', {
      type: Sequelize.STRING(18),
      allowNull: true,
      comment: 'CNPJ da empresa'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('companies', 'cnpj', {
      type: Sequelize.STRING(18),
      allowNull: false,
      comment: 'CNPJ da empresa'
    });
  }
};
