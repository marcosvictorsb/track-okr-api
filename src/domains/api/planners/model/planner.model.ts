import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@infra/database/connection/mysql';
import Company from '@domains/api/companies/model/company.model';

interface PlannerModelAttributes {
  id?: number;
  title: string;
  description: string;
  year: number;
  id_company: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

class PlannerModel
  extends Model<PlannerModelAttributes>
  implements PlannerModelAttributes
{
  declare id?: number;
  declare title: string;
  declare description: string;
  declare year: number;
  declare id_company: number;
  declare created_at?: Date;
  declare updated_at?: Date;
  declare deleted_at?: Date;
}

PlannerModel.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    title: { type: DataTypes.STRING },
    description: { type: DataTypes.STRING },
    year: { type: DataTypes.NUMBER },
    id_company: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Company, key: 'id' }
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
    sequelize: sequelize,
    tableName: 'planners',
    timestamps: true,
    underscored: true,
    paranoid: true
  }
);

export default PlannerModel;
