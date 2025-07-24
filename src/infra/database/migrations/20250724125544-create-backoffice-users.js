'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('backoffice_users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      name: {
        type: Sequelize.STRING(100),
        allowNull: false,
        comment: 'Nome completo do funcionário'
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        unique: true,
        comment: 'Email único para login'
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false,
        comment: 'Senha criptografada com bcrypt'
      },
      role: {
        type: Sequelize.ENUM('admin', 'manager', 'analyst', 'viewer'),
        allowNull: false,
        defaultValue: 'viewer',
        comment: 'Nível de acesso do usuário'
      },
      permissions: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Permissões específicas do usuário'
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: 'Se o usuário está ativo no sistema'
      },
      last_login: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Data e hora do último login'
      },
      last_login_ip: {
        type: Sequelize.STRING(45),
        allowNull: true,
        comment: 'IP do último login (suporta IPv6)'
      },
      password_reset_token: {
        type: Sequelize.STRING(255),
        allowNull: true,
        comment: 'Token para reset de senha'
      },
      password_reset_expires: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: 'Expiração do token de reset'
      },
      created_by: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: 'backoffice_users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        comment: 'Usuário que criou este registro'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal(
          'CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'
        )
      },
      deleted_at: {
        allowNull: true,
        type: Sequelize.DATE,
        comment: 'Soft delete timestamp'
      }
    });

    // Criar índices para performance
    await queryInterface.addIndex('backoffice_users', ['email'], {
      unique: true,
      name: 'backoffice_users_email_unique'
    });

    await queryInterface.addIndex('backoffice_users', ['role'], {
      name: 'backoffice_users_role_index'
    });

    await queryInterface.addIndex('backoffice_users', ['is_active'], {
      name: 'backoffice_users_active_index'
    });

    await queryInterface.addIndex(
      'backoffice_users',
      ['password_reset_token'],
      {
        name: 'backoffice_users_reset_token_index'
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('backoffice_users');
  }
};
