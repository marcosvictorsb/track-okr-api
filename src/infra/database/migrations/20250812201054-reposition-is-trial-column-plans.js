'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Primeiro, vamos remover a coluna isTrial atual
    await queryInterface.removeColumn('plans', 'isTrial');

    // Depois, vamos adicionar a coluna isTrial na posição correta (antes de created_at)
    await queryInterface.addColumn('plans', 'isTrial', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se o plano é de trial/gratuito',
      after: 'max_key_results_per_objective'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remover a coluna isTrial
    await queryInterface.removeColumn('plans', 'isTrial');

    // Recriar a coluna isTrial na posição original (no final)
    await queryInterface.addColumn('plans', 'isTrial', {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Indica se o plano é de trial/gratuito'
    });
  }
};
