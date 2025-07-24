import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../connection/mysql';

export interface SubscriptionPaymentAttributes {
  id: number;
  subscription_id: number;
  company_id: number;
  efi_charge_id?: string;
  txid?: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled' | 'failed' | 'refunded' | 'overdue';
  payment_method?: string;
  due_date?: Date;
  paid_at?: Date;
  description?: string;
  webhook_data?: object;
  created_at: Date;
  updated_at: Date;
}

export interface SubscriptionPaymentCreationAttributes {
  subscription_id: number;
  company_id: number;
  efi_charge_id?: string;
  txid?: string;
  amount: number;
  status: 'pending' | 'paid' | 'cancelled' | 'failed' | 'refunded' | 'overdue';
  payment_method?: string;
  due_date?: Date;
  paid_at?: Date;
  description?: string;
  webhook_data?: object;
}

export class SubscriptionPaymentModel
  extends Model<
    SubscriptionPaymentAttributes,
    SubscriptionPaymentCreationAttributes
  >
  implements SubscriptionPaymentAttributes
{
  public id!: number;
  public subscription_id!: number;
  public company_id!: number;
  public efi_charge_id?: string;
  public txid?: string;
  public amount!: number;
  public status!:
    | 'pending'
    | 'paid'
    | 'cancelled'
    | 'failed'
    | 'refunded'
    | 'overdue';
  public payment_method?: string;
  public due_date?: Date;
  public paid_at?: Date;
  public description?: string;
  public webhook_data?: object;
  public created_at!: Date;
  public updated_at!: Date;
}

SubscriptionPaymentModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    subscription_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'subscriptions',
        key: 'id'
      }
    },
    company_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'companies',
        key: 'id'
      }
    },
    efi_charge_id: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true
    },
    txid: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM(
        'pending',
        'paid',
        'cancelled',
        'failed',
        'refunded',
        'overdue'
      ),
      allowNull: false,
      defaultValue: 'pending'
    },
    payment_method: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    due_date: {
      type: DataTypes.DATE,
      allowNull: true
    },
    paid_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    webhook_data: {
      type: DataTypes.JSON,
      allowNull: true
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
    tableName: 'subscription_payments',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['subscription_id']
      },
      {
        fields: ['company_id']
      },
      {
        fields: ['status']
      },
      {
        fields: ['efi_charge_id'],
        unique: true
      },
      {
        fields: ['due_date']
      }
    ]
  }
);
