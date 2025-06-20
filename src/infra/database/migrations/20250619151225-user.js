'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('users', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    password_hash: {
      type: Sequelize.STRING,
      allowNull: false
    },
    role: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'user'
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'pending_activation'
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
  await queryInterface.addIndex('users', ['email'], {
    name: 'users_email_unique',
    unique: true,
    where: {
      deleted_at: null
    }
  });

  await queryInterface.addIndex('users', ['id_company'], {
    name: 'users_id_company_index'
  });

  await queryInterface.addIndex('users', ['status'], {
    name: 'users_status_index'
  });
}

export async function down(queryInterface) {
  // Remove índices primeiro para evitar erros
  await queryInterface.removeIndex('users', 'users_email_unique');
  await queryInterface.removeIndex('users', 'users_id_company_index');
  await queryInterface.removeIndex('users', 'users_status_index');
  
  await queryInterface.dropTable('users');
}