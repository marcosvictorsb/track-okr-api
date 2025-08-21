import { DataTypes, Model, Optional, Sequelize } from 'sequelize';
import { sequelize } from '@infra/database/connection/mysql';

export interface WebhookModelAttributes {
  id?: number;
  source: string;
  description: string;
  json: string;
  status: string;
  created: Date;
}

class WebhookModel
  extends Model<WebhookModelAttributes>
  implements WebhookModelAttributes
{
  declare id?: number;
  declare source: string;
  declare description: string;
  declare json: string;
  declare status: string;
  declare created: Date;
}

WebhookModel.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true
    },
    source: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    json: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.STRING(20),
      allowNull: false,
      defaultValue: 'pending'
    },
    created: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  },
  {
    sequelize,
    tableName: 'webhooks',
    timestamps: false,
    indexes: [
      {
        fields: ['source']
      },
      {
        fields: ['status']
      },
      {
        fields: ['created']
      },
      {
        fields: ['source', 'created']
      },
      {
        fields: ['source', 'status']
      }
    ]
  }
);

export default WebhookModel;
