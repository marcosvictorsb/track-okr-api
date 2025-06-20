import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@infra/database/connection/mysql';


interface CompanyAttributes {
  id?: number;
  name: string;
  cnpj: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

class Company extends Model<CompanyAttributes> implements CompanyAttributes {
  declare id?: number;
  declare name: string;
  declare cnpj: string;
  declare created_at?: Date;
  declare updated_at?: Date;
  declare deleted_at?: Date;
}

Company.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: DataTypes.STRING,
    cnpj: DataTypes.STRING,
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
    modelName: 'companies',
    tableName: 'companies',
    timestamps: true,
    underscored: true,
    paranoid: true
  }
);

export default Company;