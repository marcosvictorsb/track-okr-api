import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@infra/database/connection/mysql';
import Company from '@domains/api/companies/model/company.model';

export interface SettingModelAttributes {
  id?: number;
  block_okr_creation: boolean;
  block_key_result_creation: boolean;
  block_okr_editing: boolean;
  block_key_result_editing: boolean;
  allowed_quarters: number[];
  current_quarter_only: boolean;
  id_company: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

class SettingModel
  extends Model<SettingModelAttributes>
  implements SettingModelAttributes
{
  declare id?: number;
  declare block_okr_creation: boolean;
  declare block_key_result_creation: boolean;
  declare block_okr_editing: boolean;
  declare block_key_result_editing: boolean;
  declare allowed_quarters: number[];
  declare current_quarter_only: boolean;
  declare id_company: number;
  declare created_at?: Date;
  declare updated_at?: Date;
  declare deleted_at?: Date;
}

SettingModel.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    block_okr_creation: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    block_key_result_creation: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    block_okr_editing: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    block_key_result_editing: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    allowed_quarters: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [1, 2, 3, 4]
    },
    current_quarter_only: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
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
    tableName: 'settings',
    timestamps: true,
    underscored: true,
    paranoid: true
  }
);

// Definindo associações
SettingModel.belongsTo(Company, {
  foreignKey: 'id_company',
  as: 'company'
});

export default SettingModel;
