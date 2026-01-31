import Company from '@domains/api/companies/model/company.model';
import PlannerModel from '@domains/api/planners/model/planner.model';
import { sequelize } from '@infra/database/connection/mysql';
import { DataTypes, Model } from 'sequelize';
import { SubscriptionStatus } from '../interfaces';

export interface SubscriptionAttributes {
  id?: number;
  company_id: number;
  plan_id: number;
  status: SubscriptionStatus;
  trial_start_date?: Date;
  trial_end_date?: Date;
  started_at: Date;
  expires_at?: Date;
  canceled_at?: Date;
  suspended_at?: Date;
  grace_period_ends_at?: Date;
  auto_renew: boolean;
  cancellation_reason?: string;
  created_by?: number;
  notes?: string;
  created_at?: Date;
  updated_at?: Date;
}

class SubscriptionModel
  extends Model<SubscriptionAttributes>
  implements SubscriptionAttributes
{
  declare id: number;
  declare company_id: number;
  declare plan_id: number;
  declare status: SubscriptionStatus;
  declare trial_start_date?: Date;
  declare trial_end_date?: Date;
  declare started_at: Date;
  declare expires_at?: Date;
  declare canceled_at?: Date;
  declare suspended_at?: Date;
  declare grace_period_ends_at?: Date;
  declare auto_renew: boolean;
  declare cancellation_reason?: string;
  declare created_by?: number;
  declare notes?: string;
  declare created_at: Date;
  declare updated_at: Date;
}

SubscriptionModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Company,
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Empresa proprietária da subscription'
    },
    plan_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: PlannerModel,
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT',
      comment: 'Plano atual da subscription'
    },
    status: {
      type: DataTypes.ENUM(
        'trial',
        'active',
        'canceled',
        'expired',
        'suspended',
        'pending_activation'
      ),
      allowNull: false,
      defaultValue: 'trial',
      comment: 'Status atual da subscription'
    },
    trial_start_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data de início do trial'
    },
    trial_end_date: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data de fim do trial'
    },
    started_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
      comment: 'Data de início da subscription'
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data de expiração da subscription'
    },
    canceled_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data de cancelamento'
    },
    suspended_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Data de suspensão (falta de pagamento)'
    },
    grace_period_ends_at: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Fim do período de carência após vencimento'
    },
    auto_renew: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
      comment: 'Se a subscription renova automaticamente'
    },
    cancellation_reason: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Motivo do cancelamento'
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Usuário que criou a subscription'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações administrativas'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'SubscriptionModel',
    tableName: 'subscriptions',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: false,
    indexes: [
      {
        fields: ['company_id']
      },
      {
        fields: ['plan_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['expires_at']
      },
      {
        fields: ['trial_end_date']
      },
      {
        name: 'idx_subscriptions_company_status',
        fields: ['company_id', 'status']
      },
      {
        name: 'idx_subscriptions_status_expires',
        fields: ['status', 'expires_at']
      }
    ]
  }
);

export default SubscriptionModel;
