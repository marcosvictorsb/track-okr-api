'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.changeColumn('results_keys', 'unit', {
      type: Sequelize.STRING(50),
      allowNull: false,
      comment:
        'Unidade de medida do resultado-chave (ex: %, R$, pessoas, vendas, etc.)'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.changeColumn('results_keys', 'unit', {
      type: Sequelize.STRING(10),
      allowNull: false,
      comment: 'Unidade de medida do resultado-chave'
    });
  }
};
