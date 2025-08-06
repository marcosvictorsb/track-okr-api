import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../../infra/database/connection/mysql';

export interface SubscriptionPlanAttributes {
  id: number;
  name: string;
  description?: string;
  max_users: number;
  price_monthly: number;
  price_yearly?: number;
  features: object;
  efi_plan_id?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface SubscriptionPlanCreationAttributes {
  name: string;
  description?: string;
  max_users: number;
  price_monthly: number;
  price_yearly?: number;
  features: object;
  efi_plan_id?: string;
  is_active: boolean;
}

export class SubscriptionPlanModel
  extends Model<SubscriptionPlanAttributes, SubscriptionPlanCreationAttributes>
  implements SubscriptionPlanAttributes
{
  declare id: number;
  declare name: string;
  declare description?: string;
  declare max_users: number;
  declare price_monthly: number;
  declare price_yearly?: number;
  declare features: object;
  declare efi_plan_id?: string;
  declare is_active: boolean;
  declare created_at: Date;
  declare updated_at: Date;
}

SubscriptionPlanModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    max_users: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 10
    },
    price_monthly: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    price_yearly: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    features: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: {}
    },
    efi_plan_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true
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
    tableName: 'subscription_plans',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['name']
      },
      {
        fields: ['is_active']
      },
      {
        fields: ['efi_plan_id'],
        unique: true
      }
    ]
  }
);
