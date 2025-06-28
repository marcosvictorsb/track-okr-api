'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('planners', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.STRING,
      allowNull: true
    },
    year: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    id_company: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    created_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    updated_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    deleted_at: {
      type: Sequelize.DATE,
      allowNull: true
    }
  });

  // Adicionando índice para id_company para melhorar performance nas consultas
  await queryInterface.addIndex('planners', ['id_company'], {
    name: 'planners_id_company_index'
  });

  // Adicionando índice composto para year e id_company (útil para buscar planners por ano e empresa)
  await queryInterface.addIndex('planners', ['year', 'id_company'], {
    name: 'planners_year_company_index'
  });
}

export async function down(queryInterface) {
  await queryInterface.dropTable('planners');
}
