import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@infra/database/connection/mysql';
import SubscriptionModel from './subscription.model';

export type SubscriptionHistoryAction =
  | 'created'
  | 'activated'
  | 'upgraded'
  | 'downgraded'
  | 'renewed'
  | 'canceled'
  | 'expired'
  | 'suspended'
  | 'reactivated'
  | 'trial_started'
  | 'trial_extended'
  | 'trial_converted'
  | 'plan_changed'
  | 'limits_updated';

export interface SubscriptionHistoryAttributes {
  id?: number;
  subscription_id: number;
  action: SubscriptionHistoryAction;
  previous_status?: string;
  new_status?: string;
  previous_plan_id?: number;
  new_plan_id?: number;
  reason?: string;
  metadata?: Record<string, unknown>;
  ip_address?: string;
  user_agent?: string;
  created_by?: number;
  automated: boolean;
  notes?: string;
  created_at?: Date;
}

class SubscriptionHistoryModel
  extends Model<SubscriptionHistoryAttributes>
  implements SubscriptionHistoryAttributes
{
  declare id: number;
  declare subscription_id: number;
  declare action: SubscriptionHistoryAction;
  declare previous_status?: string;
  declare new_status?: string;
  declare previous_plan_id?: number;
  declare new_plan_id?: number;
  declare reason?: string;
  declare metadata?: Record<string, unknown>;
  declare ip_address?: string;
  declare user_agent?: string;
  declare created_by?: number;
  declare automated: boolean;
  declare notes?: string;
  declare created_at: Date;
}

SubscriptionHistoryModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false
    },
    subscription_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: SubscriptionModel,
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE',
      comment: 'Subscription relacionada'
    },
    action: {
      type: DataTypes.ENUM(
        'created',
        'activated',
        'upgraded',
        'downgraded',
        'renewed',
        'canceled',
        'expired',
        'suspended',
        'reactivated',
        'trial_started',
        'trial_extended',
        'trial_converted',
        'plan_changed',
        'limits_updated'
      ),
      allowNull: false,
      comment: 'Ação realizada na subscription'
    },
    previous_status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Status anterior'
    },
    new_status: {
      type: DataTypes.STRING(50),
      allowNull: true,
      comment: 'Novo status'
    },
    previous_plan_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'plans',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Plano anterior'
    },
    new_plan_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'plans',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
      comment: 'Novo plano'
    },
    reason: {
      type: DataTypes.STRING(500),
      allowNull: true,
      comment: 'Motivo da mudança'
    },
    metadata: {
      type: DataTypes.JSON,
      allowNull: true,
      comment: 'Dados adicionais da mudança (valores anteriores, etc.)'
    },
    ip_address: {
      type: DataTypes.STRING(45),
      allowNull: true,
      comment: 'IP de onde partiu a ação'
    },
    user_agent: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'User agent do navegador'
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
      comment: 'Usuário que executou a ação'
    },
    automated: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Se a ação foi automatizada (sistema)'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Observações sobre a mudança'
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    modelName: 'SubscriptionHistoryModel',
    tableName: 'subscription_history',
    timestamps: false, // Só temos created_at, não updated_at
    createdAt: 'created_at',
    updatedAt: false,
    paranoid: false,
    indexes: [
      {
        fields: ['subscription_id']
      },
      {
        fields: ['action']
      },
      {
        fields: ['created_by']
      },
      {
        fields: ['created_at']
      },
      {
        fields: ['automated']
      },
      {
        name: 'idx_subscription_history_timeline',
        fields: ['subscription_id', 'created_at']
      },
      {
        name: 'idx_subscription_history_action',
        fields: ['subscription_id', 'action']
      }
    ]
  }
);

export default SubscriptionHistoryModel;
