'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('profiles', {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    id_user: {
      type: Sequelize.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    photo_url: {
      type: Sequelize.STRING(500),
      allowNull: true,
      comment: 'Caminho da foto do perfil do usuário'
    },
    position: {
      type: Sequelize.STRING(100),
      allowNull: true,
      comment: 'Cargo/posição do usuário na empresa'
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
  await queryInterface.addIndex('profiles', ['id_user'], {
    name: 'profiles_id_user_unique',
    unique: true,
    where: {
      deleted_at: null
    }
  });

  await queryInterface.addIndex('profiles', ['position'], {
    name: 'profiles_position_index',
    where: {
      deleted_at: null
    }
  });

  await queryInterface.addIndex('profiles', ['created_at'], {
    name: 'profiles_created_at_index'
  });
}

export async function down(queryInterface) {
  // Remove índices primeiro para evitar erros
  await queryInterface.removeIndex('profiles', 'profiles_id_user_unique');
  await queryInterface.removeIndex('profiles', 'profiles_position_index');
  await queryInterface.removeIndex('profiles', 'profiles_created_at_index');

  await queryInterface.dropTable('profiles');
}
