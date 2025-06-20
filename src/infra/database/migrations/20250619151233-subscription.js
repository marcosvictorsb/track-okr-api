'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('subscriptions', {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    amount_users: {
      type: Sequelize.INTEGER,
      allowNull: false, // Adicionado como boa prática
      defaultValue: 1 // Valor padrão razoável
    },
    status: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: 'active' // Valor padrão
    },
    id_company: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT' // Previne deletar company com subscriptions ativas
    },
    id_external_payment: {
      type: Sequelize.STRING,
      allowNull: false, // Assumindo que é obrigatório
      unique: true // Garante que não haverá duplicação
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

  // Adicionando índices para campos frequentemente consultados
  await queryInterface.addIndex('subscriptions', ['id_company'], {
    name: 'subscriptions_id_company_index'
  });

  await queryInterface.addIndex('subscriptions', ['status'], {
    name: 'subscriptions_status_index'
  });

  await queryInterface.addIndex('subscriptions', ['id_external_payment'], {
    name: 'subscriptions_id_external_payment_unique',
    unique: true,
    where: {
      deleted_at: null  // Considera apenas registros não deletados para unicidade
    }
  });
}

export async function down(queryInterface) {
  // Remove índices primeiro
  await queryInterface.removeIndex('subscriptions', 'subscriptions_id_company_index');
  await queryInterface.removeIndex('subscriptions', 'subscriptions_status_index');
  await queryInterface.removeIndex('subscriptions', 'subscriptions_id_external_payment_unique');
  
  await queryInterface.dropTable('subscriptions');
}