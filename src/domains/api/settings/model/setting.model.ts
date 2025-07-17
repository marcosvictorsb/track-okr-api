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
  public id!: number;
  public block_okr_creation!: boolean;
  public block_key_result_creation!: boolean;
  public block_okr_editing!: boolean;
  public block_key_result_editing!: boolean;
  public allowed_quarters!: number[];
  public current_quarter_only!: boolean;
  public id_company!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;
  public readonly deleted_at!: Date;
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
