import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../../../../infra/database/connection/mysql';

export interface PlanAttributes {
  id?: number;
  name: string;
  description?: string;
  max_users: number;
  max_planners: number;
  max_teams: number;
  max_objectives_per_quarter: number;
  max_key_results_per_objective: number;
  created_at?: Date;
  updated_at?: Date | null;
  deleted_at?: Date | null;
}

export interface PlanCreationAttributes {
  name: string;
  description?: string;
  max_users: number;
  max_planners: number;
  max_teams: number;
  max_objectives_per_quarter: number;
  max_key_results_per_objective: number;
}

export class PlanModel
  extends Model<PlanAttributes, PlanCreationAttributes>
  implements PlanAttributes
{
  declare id: number;
  declare name: string;
  declare description?: string;
  declare max_users: number;
  declare max_planners: number;
  declare max_teams: number;
  declare max_objectives_per_quarter: number;
  declare max_key_results_per_objective: number;
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
    max_users: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    max_planners: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    max_teams: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    max_objectives_per_quarter: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    max_key_results_per_objective: {
      type: DataTypes.INTEGER,
      allowNull: false
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
