'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Em vez de recriar a tabela, vamos usar ALTER TABLE para reordenar as colunas
    // Isso é mais eficiente e não quebra as foreign keys

    // Mover a coluna interval para antes de created_at
    await queryInterface.sequelize.query(`
      ALTER TABLE subscription_plans 
      MODIFY COLUMN \`interval\` INT NOT NULL COMMENT 'Intervalo do plano (dias, meses, etc.)' 
      AFTER is_active
    `);

    // Mover a coluna repeats para depois de interval
    await queryInterface.sequelize.query(`
      ALTER TABLE subscription_plans 
      MODIFY COLUMN repeats INT NULL COMMENT 'Número de repetições do plano (null = infinito)' 
      AFTER \`interval\`
    `);
  },

  async down(queryInterface, Sequelize) {
    // Reverter - mover interval e repeats para o final da tabela
    await queryInterface.sequelize.query(`
      ALTER TABLE subscription_plans 
      MODIFY COLUMN \`interval\` INT NOT NULL COMMENT 'Intervalo do plano (dias, meses, etc.)' 
      AFTER deleted_at
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE subscription_plans 
      MODIFY COLUMN repeats INT NULL COMMENT 'Número de repetições do plano (null = infinito)' 
      AFTER \`interval\`
    `);
  }
};
