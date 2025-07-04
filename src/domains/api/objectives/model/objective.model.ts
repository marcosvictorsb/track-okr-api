import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@infra/database/connection/mysql';
import TeamModel from '@domains/api/teams/model/team.model';

interface ObjectiveModelAttributes {
  id?: number;
  title: string;
  description?: string;
  id_team: number;
  status: 'active' | 'cancelled' | 'completed';
  quarter: number;
  year: number;
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
  declare status: 'active' | 'cancelled' | 'completed';
  declare quarter: number;
  declare year: number;
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

// Definindo associações
ObjectiveModel.belongsTo(TeamModel, {
  foreignKey: 'id_team',
  as: 'team'
});

export default ObjectiveModel;
