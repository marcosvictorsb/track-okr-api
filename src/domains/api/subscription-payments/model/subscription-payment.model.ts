import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@infra/database/connection/mysql';

export interface SubscriptionPaymentAttributes {
  id: number;
  id_subscription: number;
  id_company: number;
  efi_charge_id?: string;
  efi_subscription_id?: string;
  txid?: string;
  amount: number;
  status:
    | 'pending'
    | 'paid'
    | 'cancelled'
    | 'failed'
    | 'refunded'
    | 'overdue'
    | 'expired';
  payment_method?: string;
  due_date?: Date;
  paid_at?: Date;
  payment_link?: string;
  description?: string;
  webhook_data?: object;
  created_at: Date;
  updated_at: Date;
}

export interface SubscriptionPaymentCreationAttributes {
  id_subscription: number;
  id_company: number;
  efi_charge_id?: string;
  efi_subscription_id?: string;
  txid?: string;
  amount: number;
  status:
    | 'pending'
    | 'paid'
    | 'cancelled'
    | 'failed'
    | 'refunded'
    | 'overdue'
    | 'expired';
  payment_method?: string;
  due_date?: Date;
  paid_at?: Date;
  payment_link?: string;
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
  declare id: number;
  declare id_subscription: number;
  declare id_company: number;
  declare efi_charge_id?: string;
  declare efi_subscription_id?: string;
  declare txid?: string;
  declare amount: number;
  declare status:
    | 'pending'
    | 'paid'
    | 'cancelled'
    | 'failed'
    | 'refunded'
    | 'overdue'
    | 'expired';
  declare payment_method?: string;
  declare due_date?: Date;
  declare paid_at?: Date;
  declare payment_link?: string;
  declare description?: string;
  declare webhook_data?: object;
  declare created_at: Date;
  declare updated_at: Date;
}

SubscriptionPaymentModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    id_subscription: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'subscriptions',
        key: 'id'
      }
    },
    id_company: {
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
    efi_subscription_id: {
      type: DataTypes.STRING(100),
      allowNull: true
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
        'overdue',
        'expired'
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
    payment_link: {
      type: DataTypes.TEXT,
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
        fields: ['id_subscription']
      },
      {
        fields: ['id_company']
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
