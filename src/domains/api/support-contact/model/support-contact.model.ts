import { sequelize } from '@infra/database/connection/mysql';
import { DataTypes, Model } from 'sequelize';

export interface SupportContactModelAttributes {
  id?: number;
  user_id?: number | null;
  company_id?: number | null;
  name?: string;
  contact_preference: string;
  contact_value: string;
  message: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'new' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed';
  assigned_to?: number | null;
  ip_address?: string | null;
  user_agent?: string | null;
  metadata?: Record<string, unknown> | null;
  resolved_at?: Date | null;
  created_at?: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}

class SupportContactModel
  extends Model<SupportContactModelAttributes>
  implements SupportContactModelAttributes
{
  declare id?: number;
  declare user_id?: number | null;
  declare company_id?: number | null;
  declare name?: string;
  declare contact_preference: string;
  declare contact_value: string;
  declare message: string;
  declare priority: 'low' | 'medium' | 'high' | 'urgent';
  declare status:
    | 'new'
    | 'in_progress'
    | 'waiting_user'
    | 'resolved'
    | 'closed';
  declare assigned_to?: number | null;
  declare ip_address?: string | null;
  declare user_agent?: string | null;
  declare metadata?: Record<string, unknown> | null;
  declare resolved_at?: Date | null;
  declare created_at?: Date;
  declare updated_at?: Date | null;
  declare deleted_at?: Date | null;
}

SupportContactModel.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    user_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    company_id: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    contact_preference: {
      type: DataTypes.STRING(50),
      allowNull: false,
      defaultValue: 'email'
    },
    contact_value: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    priority: {
      type: DataTypes.ENUM('low', 'medium', 'high', 'urgent'),
      allowNull: false,
      defaultValue: 'medium'
    },
    status: {
      type: DataTypes.ENUM(
        'new',
        'in_progress',
        'waiting_user',
        'resolved',
        'closed'
      ),
      allowNull: false,
      defaultValue: 'new'
    },
    assigned_to: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
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
    sequelize,
    modelName: 'SupportContact',
    tableName: 'support_contacts',
    timestamps: true,
    paranoid: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  }
);

export default SupportContactModel;
