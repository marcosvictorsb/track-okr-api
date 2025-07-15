'use strict';

/** @type {import('sequelize-cli').Migration} */
export async function up(queryInterface, Sequelize) {
  await queryInterface.createTable('landing_page_leads', {
    id: {
      type: Sequelize.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    name: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: 'Nome completo do lead'
    },
    email: {
      type: Sequelize.STRING(255),
      allowNull: false,
      comment: 'Email do lead'
    },
    company: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Nome da empresa do lead'
    },
    position: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'Cargo/posição do lead na empresa'
    },
    company_size: {
      type: Sequelize.STRING(50),
      allowNull: true,
      comment: 'Tamanho da empresa (ex: 1-10, 11-50, 51-200, etc.)'
    },
    source: {
      type: Sequelize.STRING(100),
      allowNull: false,
      defaultValue: 'landing-page',
      comment: 'Origem do lead (landing-page, etc.)'
    },
    page_url: {
      type: Sequelize.STRING(1000),
      allowNull: true,
      comment: 'URL da página onde o lead foi capturado'
    },
    user_agent: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'User agent do navegador do lead'
    },
    ip_address: {
      type: Sequelize.STRING(45),
      allowNull: true,
      comment: 'Endereço IP do lead (IPv4 ou IPv6)'
    },
    utm_source: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'UTM source para tracking de campanha'
    },
    utm_medium: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'UTM medium para tracking de campanha'
    },
    utm_campaign: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'UTM campaign para tracking de campanha'
    },
    utm_term: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'UTM term para tracking de campanha'
    },
    utm_content: {
      type: Sequelize.STRING(255),
      allowNull: true,
      comment: 'UTM content para tracking de campanha'
    },
    status: {
      type: Sequelize.ENUM(
        'new',
        'contacted',
        'qualified',
        'converted',
        'lost'
      ),
      allowNull: false,
      defaultValue: 'new',
      comment: 'Status do lead no funil de vendas'
    },
    notes: {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Notas adicionais sobre o lead'
    },
    contacted_at: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Data e hora do primeiro contato'
    },
    converted_at: {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Data e hora da conversão'
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
  await queryInterface.addIndex('landing_page_leads', ['email'], {
    name: 'landing_page_leads_email_idx'
  });

  await queryInterface.addIndex('landing_page_leads', ['company'], {
    name: 'landing_page_leads_company_idx'
  });

  await queryInterface.addIndex('landing_page_leads', ['source'], {
    name: 'landing_page_leads_source_idx'
  });

  await queryInterface.addIndex('landing_page_leads', ['status'], {
    name: 'landing_page_leads_status_idx'
  });

  await queryInterface.addIndex('landing_page_leads', ['created_at'], {
    name: 'landing_page_leads_created_at_idx'
  });

  await queryInterface.addIndex('landing_page_leads', ['company_size'], {
    name: 'landing_page_leads_company_size_idx'
  });

  // Índice composto para busca por UTM
  await queryInterface.addIndex(
    'landing_page_leads',
    ['utm_source', 'utm_medium', 'utm_campaign'],
    {
      name: 'landing_page_leads_utm_idx'
    }
  );

  // Índice para evitar duplicatas por email + empresa
  await queryInterface.addIndex('landing_page_leads', ['email', 'company'], {
    name: 'landing_page_leads_email_company_idx'
  });
}

export async function down(queryInterface, _Sequelize) {
  // Remover índices primeiro
  await queryInterface.removeIndex(
    'landing_page_leads',
    'landing_page_leads_email_idx'
  );
  await queryInterface.removeIndex(
    'landing_page_leads',
    'landing_page_leads_company_idx'
  );
  await queryInterface.removeIndex(
    'landing_page_leads',
    'landing_page_leads_source_idx'
  );
  await queryInterface.removeIndex(
    'landing_page_leads',
    'landing_page_leads_status_idx'
  );
  await queryInterface.removeIndex(
    'landing_page_leads',
    'landing_page_leads_created_at_idx'
  );
  await queryInterface.removeIndex(
    'landing_page_leads',
    'landing_page_leads_company_size_idx'
  );
  await queryInterface.removeIndex(
    'landing_page_leads',
    'landing_page_leads_utm_idx'
  );
  await queryInterface.removeIndex(
    'landing_page_leads',
    'landing_page_leads_email_company_idx'
  );

  // Remover tabela
  await queryInterface.dropTable('landing_page_leads');
}
