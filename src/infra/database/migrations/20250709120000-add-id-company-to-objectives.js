'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Primeiro, adicionar coluna id_company como nullable
    await queryInterface.addColumn(
      'objectives',
      'id_company',
      {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'companies',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      {
        after: 'description'
      }
    );

    // Atualizar registros existentes com id_company baseado no team
    // Assumindo que teams tem id_company, vamos pegar da primeira company disponível
    await queryInterface.sequelize.query(`
      UPDATE objectives o 
      INNER JOIN teams t ON o.id_team = t.id 
      SET o.id_company = t.id_company 
      WHERE o.id_company IS NULL
    `);

    // Se ainda houver registros sem id_company, usar a primeira company disponível
    const [companies] = await queryInterface.sequelize.query(
      'SELECT id FROM companies ORDER BY id LIMIT 1'
    );

    if (companies.length > 0) {
      const firstCompanyId = companies[0].id;
      await queryInterface.sequelize.query(`
        UPDATE objectives 
        SET id_company = ${firstCompanyId} 
        WHERE id_company IS NULL
      `);
    }

    // Agora tornar a coluna NOT NULL
    await queryInterface.changeColumn('objectives', 'id_company', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    });

    // Adicionar índice para id_company para melhorar performance nas consultas
    await queryInterface.addIndex('objectives', ['id_company']);

    // Adicionar índice composto para id_company e status
    await queryInterface.addIndex('objectives', ['id_company', 'status']);

    // Adicionar índice composto para id_company, quarter e year
    await queryInterface.addIndex('objectives', [
      'id_company',
      'quarter',
      'year'
    ]);
  },

  async down(queryInterface) {
    // Remover os índices primeiro
    await queryInterface.removeIndex('objectives', [
      'id_company',
      'quarter',
      'year'
    ]);
    await queryInterface.removeIndex('objectives', ['id_company', 'status']);
    await queryInterface.removeIndex('objectives', ['id_company']);

    // Remover a coluna id_company
    await queryInterface.removeColumn('objectives', 'id_company');
  }
};
