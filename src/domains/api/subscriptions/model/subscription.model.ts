import Company from '@domains/api/companies/model/company.model';
import { sequelize } from '@infra/database/connection/mysql';
import { DataTypes, Model } from 'sequelize';


class Subscription extends Model {
  declare id?: number;
  declare id_company?: number;
  declare amount_users?: number;
  declare status?: string;
  declare id_external_payment?: string;
  declare created_at?: Date;
  declare updated_at?: Date;
  declare deleted_at?: Date;
}

Subscription.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    id_company: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: Company, key: 'id' }
    },
    amount_users: DataTypes.INTEGER,
    status: DataTypes.STRING, // ('active', 'cancelled'),
    id_external_payment: DataTypes.STRING,
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
    modelName: 'subscriptions',
    tableName: 'subscriptions',
    timestamps: true,
    underscored: true,
    paranoid: true
  }
);

export default Subscription;
