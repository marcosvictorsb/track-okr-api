'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('objectives', 'id_planner', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'planners',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Adicionar índice para melhorar performance das consultas
    await queryInterface.addIndex('objectives', ['id_planner'], {
      name: 'idx_objectives_id_planner'
    });
  },

  async down(queryInterface, Sequelize) {
    // Remover índice primeiro
    await queryInterface.removeIndex('objectives', 'idx_objectives_id_planner');

    // Remover coluna
    await queryInterface.removeColumn('objectives', 'id_planner');
  }
};
