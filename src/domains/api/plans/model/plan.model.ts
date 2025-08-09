import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../../infra/database/connection/mysql';

export interface PlanAttributes {
  id: number;
  name: string;
  description?: string;
  interval: number;
  repeats: number | null;
  efi_plan_id?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
  deleted_at?: Date | null;
}

export interface PlanCreationAttributes {
  name: string;
  description?: string;
  interval: number;
  repeats: number | null;
  efi_plan_id?: string;
  is_active: boolean;
}

export class PlanModel
  extends Model<PlanAttributes, PlanCreationAttributes>
  implements PlanAttributes
{
  declare id: number;
  declare name: string;
  declare description?: string;
  declare interval: number;
  declare repeats: number | null;
  declare efi_plan_id?: string;
  declare is_active: boolean;
  declare created_at: Date;
  declare updated_at: Date;
  declare deleted_at?: Date | null;
}

PlanModel.init(
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
    interval: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    repeats: {
      type: DataTypes.INTEGER,
      allowNull: true
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
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    sequelize,
    tableName: 'plans',
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
