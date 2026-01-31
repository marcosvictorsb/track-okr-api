import CompanyModel from '@domains/api/companies/model/company.model';
import PlannerModel from '@domains/api/planners/model/planner.model';
import TeamModel from '@domains/api/teams/model/team.model';
import { sequelize } from '@infra/database/connection/mysql';
import { DataTypes, Model } from 'sequelize';

interface ObjectiveModelAttributes {
  id?: number;
  title: string;
  description?: string;
  id_team: number;
  id_company: number;
  status: string; // 'active' | 'cancelled' | 'completed';
  quarter: number;
  year: number;
  id_planner?: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

class ObjectiveModel
  extends Model<ObjectiveModelAttributes>
  implements ObjectiveModelAttributes
{
  declare id?: number;
  declare title: string;
  declare description?: string;
  declare id_team: number;
  declare id_company: number;
  declare status: string; //'active' | 'cancelled' | 'completed';
  declare quarter: number;
  declare year: number;
  declare id_planner?: number;
  declare created_at?: Date;
  declare updated_at?: Date;
  declare deleted_at?: Date;
}

ObjectiveModel.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    id_team: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: TeamModel, key: 'id' }
    },
    id_company: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'companies', key: 'id' }
    },
    status: {
      type: DataTypes.ENUM('active', 'cancelled', 'completed'),
      allowNull: false,
      defaultValue: 'active'
    },
    quarter: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
        max: 4
      }
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    id_planner: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'planners', key: 'id' }
    },
    created_at: {
      allowNull: false,
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      allowNull: true,
      type: DataTypes.DATE
    },
    deleted_at: {
      allowNull: true,
      type: DataTypes.DATE
    }
  },
  {
    sequelize,
    modelName: 'Objective',
    tableName: 'objectives',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  }
);

ObjectiveModel.belongsTo(TeamModel, {
  foreignKey: 'id_team',
  as: 'team'
});

ObjectiveModel.belongsTo(CompanyModel, {
  foreignKey: 'id_company',
  as: 'company'
});

ObjectiveModel.belongsTo(PlannerModel, {
  foreignKey: 'id_planner',
  as: 'planner'
});

export default ObjectiveModel;
