'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('support_contacts', {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    user_id: {
      type: Sequelize.BIGINT,
      allowNull: true,
      comment:
        'ID do usuário que enviou o contato (opcional para usuários não logados)'
    },
    company_id: {
      type: Sequelize.BIGINT,
      allowNull: true,
      comment: 'ID da empresa do usuário (opcional)'
    },
    name: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: 'Nome da pessoa que está entrando em contato'
    },
    contact_preference: {
      type: Sequelize.STRING(50),
      allowNull: false,
      defaultValue: 'email',
      comment: 'Preferência de contato (email, telefone, whatsapp, etc.)'
    },
    contact_value: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: 'Valor do contato (email ou telefone dependendo da preferência)'
    },
    message: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Mensagem do usuário'
    },
    priority: {
      type: Sequelize.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium',
      comment: 'Prioridade do atendimento'
    },
    status: {
      type: Sequelize.ENUM(
        'new',
        'in_progress',
        'waiting_user',
        'resolved',
        'closed'
      ),
      allowNull: false,
      defaultValue: 'new',
      comment: 'Status do atendimento'
    },
    assigned_to: {
      type: Sequelize.BIGINT,
      allowNull: true,
      comment: 'ID do usuário do suporte responsável pelo atendimento'
    },
    ip_address: {
      type: Sequelize.STRING(45),
      allowNull: true,
      comment: 'Endereço IP do usuário (IPv4 ou IPv6)'
    },
    user_agent: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'User agent do navegador do usuário'
    },
    metadata: {
      type: Sequelize.JSON,
      allowNull: true,
      comment:
        'Informações adicionais em JSON (url da página, dados do erro, etc.)'
    },
    resolved_at: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Data e hora da resolução do problema'
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
  await queryInterface.addIndex('support_contacts', ['user_id'], {
    name: 'support_contacts_user_id_idx'
  });

  await queryInterface.addIndex('support_contacts', ['company_id'], {
    name: 'support_contacts_company_id_idx'
  });

  await queryInterface.addIndex('support_contacts', ['contact_preference'], {
    name: 'support_contacts_contact_preference_idx'
  });

  await queryInterface.addIndex('support_contacts', ['priority'], {
    name: 'support_contacts_priority_idx'
  });

  await queryInterface.addIndex('support_contacts', ['status'], {
    name: 'support_contacts_status_idx'
  });

  await queryInterface.addIndex('support_contacts', ['assigned_to'], {
    name: 'support_contacts_assigned_to_idx'
  });

  await queryInterface.addIndex('support_contacts', ['created_at'], {
    name: 'support_contacts_created_at_idx'
  });

  // Índice composto para busca por status e prioridade
  await queryInterface.addIndex('support_contacts', ['status', 'priority'], {
    name: 'support_contacts_status_priority_idx'
  });

  // Índice para busca por email
  await queryInterface.addIndex('support_contacts', ['contact_value'], {
    name: 'support_contacts_contact_value_idx'
  });
}

export async function down(queryInterface, _Sequelize) {
  // Remover índices primeiro
  await queryInterface.removeIndex(
    'support_contacts',
    'support_contacts_user_id_idx'
  );
  await queryInterface.removeIndex(
    'support_contacts',
    'support_contacts_company_id_idx'
  );
  await queryInterface.removeIndex(
    'support_contacts',
    'support_contacts_contact_preference_idx'
  );
  await queryInterface.removeIndex(
    'support_contacts',
    'support_contacts_priority_idx'
  );
  await queryInterface.removeIndex(
    'support_contacts',
    'support_contacts_status_idx'
  );
  await queryInterface.removeIndex(
    'support_contacts',
    'support_contacts_assigned_to_idx'
  );
  await queryInterface.removeIndex(
    'support_contacts',
    'support_contacts_created_at_idx'
  );
  await queryInterface.removeIndex(
    'support_contacts',
    'support_contacts_status_priority_idx'
  );
  await queryInterface.removeIndex(
    'support_contacts',
    'support_contacts_contact_value_idx'
  );

  // Remover tabela
  await queryInterface.dropTable('support_contacts');
}
