import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@infra/database/connection/mysql';
import Company from '@domains/api/companies/model/company.model';

interface UserModelAttributes {
  id?: number;
  name: string;
  email: string;
  password_hash: string;
  role: string;
  status: string;
  id_company: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

class UserModel
  extends Model<UserModelAttributes>
  implements UserModelAttributes
{
  declare id?: number;
  declare name: string;
  declare email: string;
  declare role: string;
  declare password_hash: string;
  declare status: string;
  declare id_company: number;
  declare created_at?: Date;
  declare updated_at?: Date;
  declare deleted_at?: Date;
}

UserModel.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    name: { type: DataTypes.STRING },
    email: { type: DataTypes.STRING },
    password_hash: { type: DataTypes.STRING },
    role: { type: DataTypes.STRING },
    status: {
      type: DataTypes.STRING // ('pending_activation', 'active'),
    },
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
    tableName: 'users',
    timestamps: true,
    underscored: true,
    paranoid: true
  }
);

export default UserModel;
