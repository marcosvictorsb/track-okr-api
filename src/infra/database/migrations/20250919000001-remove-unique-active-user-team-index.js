'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, _Sequelize) {
  // Remove apenas o índice unique_active_user_team da tabela user_teams
  await queryInterface.removeIndex('user_teams', 'unique_active_user_team');
}

export async function down(queryInterface, _Sequelize) {
  // Recria o índice caso precise reverter
  await queryInterface.addIndex('user_teams', ['id_user', 'id_team'], {
    unique: true,
    where: {
      deleted_at: null
    },
    name: 'unique_active_user_team'
  });
}
