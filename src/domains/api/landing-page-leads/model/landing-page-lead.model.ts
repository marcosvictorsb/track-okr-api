import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@infra/database/connection/mysql';

export interface LandingPageLeadModelAttributes {
  id?: number;
  name: string;
  email: string;
  company?: string | null;
  phone?: string | null;
  position?: string | null;
  company_size?: string | null;
  source: string;
  page_url?: string | null;
  user_agent?: string | null;
  ip_address?: string | null;
  utm_source?: string | null;
  utm_medium?: string | null;
  utm_campaign?: string | null;
  utm_term?: string | null;
  utm_content?: string | null;
  status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  notes?: string | null;
  contacted_at?: Date | null;
  converted_at?: Date | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

class LandingPageLeadModel
  extends Model<LandingPageLeadModelAttributes>
  implements LandingPageLeadModelAttributes
{
  declare id?: number;
  declare name: string;
  declare email: string;
  declare company?: string | null;
  declare phone?: string | null;
  declare position?: string | null;
  declare company_size?: string | null;
  declare source: string;
  declare page_url?: string | null;
  declare user_agent?: string | null;
  declare ip_address?: string | null;
  declare utm_source?: string | null;
  declare utm_medium?: string | null;
  declare utm_campaign?: string | null;
  declare utm_term?: string | null;
  declare utm_content?: string | null;
  declare status: 'new' | 'contacted' | 'qualified' | 'converted' | 'lost';
  declare notes?: string | null;
  declare contacted_at?: Date | null;
  declare converted_at?: Date | null;
  declare created_at?: Date;
  declare updated_at?: Date;
  declare deleted_at?: Date;

  // Métodos auxiliares
  public hasCompany(): boolean {
    return !!(this.company && this.company.trim().length > 0);
  }

  public hasPhone(): boolean {
    return !!(this.phone && this.phone.trim().length > 0);
  }

  public hasPosition(): boolean {
    return !!(this.position && this.position.trim().length > 0);
  }

  public isNew(): boolean {
    return this.status === 'new';
  }

  public isContacted(): boolean {
    return this.status === 'contacted';
  }

  public isQualified(): boolean {
    return this.status === 'qualified';
  }

  public isConverted(): boolean {
    return this.status === 'converted';
  }

  public isLost(): boolean {
    return this.status === 'lost';
  }

  public hasUTMTracking(): boolean {
    return !!(this.utm_source || this.utm_medium || this.utm_campaign);
  }

  public getFullName(): string {
    return this.name;
  }

  public getCompanyInfo(): string {
    const parts: string[] = [];
    if (this.company) parts.push(this.company);
    if (this.position) parts.push(this.position);
    if (this.company_size) parts.push(`(${this.company_size} funcionários)`);
    return parts.join(' - ') || 'Informações não disponíveis';
  }

  public markAsContacted(): void {
    this.status = 'contacted';
    this.contacted_at = new Date();
  }

  public markAsConverted(): void {
    this.status = 'converted';
    this.converted_at = new Date();
  }
}

LandingPageLeadModel.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Nome completo do lead'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      comment: 'Email do lead'
    },
    company: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Nome da empresa do lead'
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
      comment: 'Telefone do lead'
    },
    position: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'Cargo/posição do lead na empresa'
    },
    company_size: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Tamanho da empresa (ex: 1-10, 11-50, 51-200, etc.)'
    },
    source: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'landing-page',
      comment: 'Origem do lead (landing-page, etc.)'
    },
    page_url: {
      type: DataTypes.STRING(1000),
      allowNull: true,
      comment: 'URL da página onde o lead foi capturado'
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'User agent do navegador do lead'
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: 'Endereço IP do lead (IPv4 ou IPv6)'
    },
    utm_source: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'UTM source para tracking de campanha'
    },
    utm_medium: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'UTM medium para tracking de campanha'
    },
    utm_campaign: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'UTM campaign para tracking de campanha'
    },
    utm_term: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'UTM term para tracking de campanha'
    },
    utm_content: {
      type: DataTypes.STRING(255),
      allowNull: true,
      comment: 'UTM content para tracking de campanha'
    },
    status: {
      type: DataTypes.ENUM(
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
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Notas adicionais sobre o lead'
    },
    contacted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data e hora do primeiro contato'
    },
    converted_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data e hora da conversão'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: 'landing_page_leads',
    sequelize,
    paranoid: true, // Soft delete
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    indexes: [
      {
        fields: ['email']
      },
      {
        fields: ['company']
      },
      {
        fields: ['source']
      },
      {
        fields: ['status']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['company_size']
      },
      {
        fields: ['utm_source', 'utm_medium', 'utm_campaign']
      },
      {
        fields: ['email', 'company']
      }
    ]
  }
);

export default LandingPageLeadModel;
