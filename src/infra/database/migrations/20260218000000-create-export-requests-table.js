'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('export_requests', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    id_user: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'pending'
    },
    id_company: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    requested_at: {
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    completed_at: {
      type: Sequelize.DATE,
      allowNull: true
    },
    error_message: {
      type: Sequelize.TEXT,
      allowNull: true
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

  // Adicionando índices para melhor performance
  await queryInterface.addIndex('export_requests', ['id_user'], {
    name: 'export_requests_id_user_index'
  });

  await queryInterface.addIndex('export_requests', ['id_company'], {
    name: 'export_requests_id_company_index'
  });

  await queryInterface.addIndex('export_requests', ['status'], {
    name: 'export_requests_status_index'
  });

  await queryInterface.addIndex('export_requests', ['requested_at'], {
    name: 'export_requests_requested_at_index'
  });
}

export async function down(queryInterface) {
  // Remove índices primeiro para evitar erros
  await queryInterface.removeIndex(
    'export_requests',
    'export_requests_id_user_index'
  );
  await queryInterface.removeIndex(
    'export_requests',
    'export_requests_id_company_index'
  );
  await queryInterface.removeIndex(
    'export_requests',
    'export_requests_status_index'
  );
  await queryInterface.removeIndex(
    'export_requests',
    'export_requests_requested_at_index'
  );

  await queryInterface.dropTable('export_requests');
}
