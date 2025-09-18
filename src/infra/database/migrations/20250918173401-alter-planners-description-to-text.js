'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Alterar o campo description da tabela planners de VARCHAR(255) para TEXT
     * para suportar descrições longas do planejamento anual da empresa
     */
    await queryInterface.changeColumn('planners', 'description', {
      type: Sequelize.TEXT,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    /**
     * Reverter a alteração, voltando o campo description para VARCHAR(255)
     * ATENÇÃO: Dados com mais de 255 caracteres serão truncados!
     */
    await queryInterface.changeColumn('planners', 'description', {
      type: Sequelize.STRING,
      allowNull: true
    });
  }
};
