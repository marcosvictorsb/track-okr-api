import { sequelize } from '@infra/database/connection/mysql';
import { DataTypes, Model } from 'sequelize';

export interface PasswordResetTokenAttributes {
  id?: number;
  email: string;
  token: string;
  expires_at: Date;
  used: boolean;
  created_at?: Date;
  updated_at?: Date;
}

class PasswordResetTokenModel
  extends Model<PasswordResetTokenAttributes>
  implements PasswordResetTokenAttributes
{
  declare id?: number;
  declare email: string;
  declare token: string;
  declare expires_at: Date;
  declare used: boolean;
  declare created_at?: Date;
  declare updated_at?: Date;
}

PasswordResetTokenModel.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    token: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false
    },
    used: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    }
  },
  {
    sequelize,
    modelName: 'PasswordResetToken',
    tableName: 'password_reset_tokens',
    paranoid: false,
    timestamps: true,
    underscored: true
  }
);

export default PasswordResetTokenModel;
