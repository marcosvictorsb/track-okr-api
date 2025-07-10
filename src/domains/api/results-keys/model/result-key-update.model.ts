import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@infra/database/connection/mysql';
import ResultKeyModel from './result-key.model';
import UserModel from '@domains/api/users/model/user.model';

interface ResultKeyUpdateModelAttributes {
  id?: number;
  id_result_key: number;
  previous_value?: number | null;
  new_value: number;
  comment?: string | null;
  id_user: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

class ResultKeyUpdateModel
  extends Model<ResultKeyUpdateModelAttributes>
  implements ResultKeyUpdateModelAttributes
{
  declare id?: number;
  declare id_result_key: number;
  declare previous_value?: number | null;
  declare new_value: number;
  declare comment?: string | null;
  declare id_user: number;
  declare created_at?: Date;
  declare updated_at?: Date;
  declare deleted_at?: Date;
}

ResultKeyUpdateModel.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    id_result_key: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: ResultKeyModel, key: 'id' }
    },
    previous_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true
    },
    new_value: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: UserModel, key: 'id' }
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
    modelName: 'ResultKeyUpdate',
    tableName: 'result_key_updates',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  }
);

// Definindo associações
ResultKeyUpdateModel.belongsTo(ResultKeyModel, {
  foreignKey: 'id_result_key',
  as: 'result_key'
});

ResultKeyUpdateModel.belongsTo(UserModel, {
  foreignKey: 'id_user',
  as: 'user'
});

// Associação inversa no ResultKeyModel
ResultKeyModel.hasMany(ResultKeyUpdateModel, {
  foreignKey: 'id_result_key',
  as: 'updates'
});

export default ResultKeyUpdateModel;
