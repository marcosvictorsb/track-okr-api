'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, _Sequelize) {
  try {
    // Primeiro, tentar remover a constraint existente se ela existir
    try {
      await queryInterface.removeIndex('user_teams', 'unique_active_user_team');
      console.log('✅ Constraint unique_active_user_team removida');
    } catch (error) {
      console.log(
        '⚠️ Constraint unique_active_user_team não existia ou erro ao remover:',
        error.message
      );
    }

    // Recriar a constraint única que ignora registros deletados
    await queryInterface.addIndex('user_teams', ['id_user', 'id_team'], {
      unique: true,
      where: {
        deleted_at: null
      },
      name: 'unique_active_user_team'
    });

    console.log(
      '✅ Constraint unique_active_user_team recriada com WHERE deleted_at IS NULL'
    );
  } catch (error) {
    console.error('❌ Erro ao recriar constraint:', error);
    throw error;
  }
}

export async function down(queryInterface, _Sequelize) {
  // Remover a constraint
  await queryInterface.removeIndex('user_teams', 'unique_active_user_team');
}
