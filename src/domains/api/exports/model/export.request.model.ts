import { sequelize } from '@infra/database/connection/mysql';
import { DataTypes, Model } from 'sequelize';

export interface ExportRequestModelAttributes {
  id?: number;
  id_user: number;
  email: string;
  status: string;
  id_company: number;
  requested_at: Date;
  completed_at?: Date | null;
  error_message?: string | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

class ExportRequestModel
  extends Model<ExportRequestModelAttributes>
  implements ExportRequestModelAttributes
{
  declare id?: number;
  declare id_user: number;
  declare email: string;
  declare status: string;
  declare id_company: number;
  declare requested_at: Date;
  declare completed_at?: Date | null;
  declare error_message?: string | null;
  declare created_at?: Date;
  declare updated_at?: Date;
  declare deleted_at?: Date;
}

ExportRequestModel.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING, // 'pending', 'error', 'completed'
      allowNull: false
    },
    id_company: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    requested_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    error_message: {
      type: DataTypes.TEXT,
      allowNull: true
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
    tableName: 'export_requests',
    timestamps: true,
    underscored: true,
    paranoid: true
  }
);

export default ExportRequestModel;
