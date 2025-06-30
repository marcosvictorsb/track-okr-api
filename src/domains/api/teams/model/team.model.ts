import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@infra/database/connection/mysql';
import Company from '@domains/api/companies/model/company.model';

interface TeamModelAttributes {
  id?: number;
  name: string;
  description: string;
  amount_users: number;
  id_company: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

class TeamModel
  extends Model<TeamModelAttributes>
  implements TeamModelAttributes
{
  declare id?: number;
  declare name: string;
  declare description: string;
  declare amount_users: number;
  declare id_company: number;
  declare created_at?: Date;
  declare updated_at?: Date;
  declare deleted_at?: Date;
}

TeamModel.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: { type: DataTypes.STRING },
    description: { type: DataTypes.STRING },
    amount_users: { type: DataTypes.NUMBER },
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
    tableName: 'teams',
    timestamps: true,
    underscored: true,
    paranoid: true
  }
);

export default TeamModel;
