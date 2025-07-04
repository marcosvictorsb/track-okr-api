import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@infra/database/connection/mysql';
import UserModel from '@domains/api/users/model/user.model';
import TeamModel from '@domains/api/teams/model/team.model';

export interface UserTeamModelAttributes {
  id?: number;
  id_user: number;
  id_team: number;
  role_in_team: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

class UserTeamModel
  extends Model<UserTeamModelAttributes>
  implements UserTeamModelAttributes
{
  declare id?: number;
  declare id_user: number;
  declare id_team: number;
  declare role_in_team: string;
  declare created_at?: Date;
  declare updated_at?: Date;
  declare deleted_at?: Date;
}

UserTeamModel.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.INTEGER
    },
    id_user: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: UserModel, key: 'id' }
    },
    id_team: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: TeamModel, key: 'id' }
    },
    role_in_team: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'member'
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
    modelName: 'UserTeam',
    tableName: 'user_teams',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true
  }
);

// Definir associações
UserTeamModel.belongsTo(UserModel, {
  foreignKey: 'id_user',
  as: 'user'
});

UserTeamModel.belongsTo(TeamModel, {
  foreignKey: 'id_team',
  as: 'team'
});

// Associações inversas
UserModel.hasMany(UserTeamModel, {
  foreignKey: 'id_user',
  as: 'userTeams'
});

TeamModel.hasMany(UserTeamModel, {
  foreignKey: 'id_team',
  as: 'teamUsers'
});

export default UserTeamModel;
