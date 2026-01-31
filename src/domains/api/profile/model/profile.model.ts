import UserModel from '@domains/api/users/model/user.model';
import { sequelize } from '@infra/database/connection/mysql';
import { DataTypes, Model } from 'sequelize';

export interface ProfileModelAttributes {
  id?: number;
  id_user: number;
  photo_url?: string | null;
  position?: string | null;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

class ProfileModel
  extends Model<ProfileModelAttributes>
  implements ProfileModelAttributes
{
  declare id?: number;
  declare id_user: number;
  declare photo_url?: string | null;
  declare position?: string | null;
  declare created_at?: Date;
  declare updated_at?: Date;
  declare deleted_at?: Date;

  public hasPhoto(): boolean {
    return !!(this.photo_url && this.photo_url.trim().length > 0);
  }

  public hasPosition(): boolean {
    return !!(this.position && this.position.trim().length > 0);
  }

  public getDisplayName(): string {
    return this.position || 'Cargo não informado';
  }
}

ProfileModel.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: UserModel, key: 'id' }
    },
    photo_url: {
      type: DataTypes.STRING(500),
      allowNull: true,
      validate: {
        len: {
          args: [0, 500],
          msg: 'photo_url deve ter no máximo 500 caracteres'
        }
      }
    },
    position: {
      type: DataTypes.STRING(100),
      allowNull: true,
      validate: {
        len: {
          args: [0, 100],
          msg: 'position deve ter no máximo 100 caracteres'
        }
      }
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
    modelName: 'Profile',
    tableName: 'profiles',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
  }
);

ProfileModel.belongsTo(UserModel, {
  foreignKey: 'id_user',
  as: 'user'
});

UserModel.hasOne(ProfileModel, {
  foreignKey: 'id_user',
  as: 'profile'
});

export default ProfileModel;
