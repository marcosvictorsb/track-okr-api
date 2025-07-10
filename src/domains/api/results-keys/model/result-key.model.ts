import { DataTypes, Model } from 'sequelize';
import { sequelize } from '@infra/database/connection/mysql';
import TeamModel from '@domains/api/teams/model/team.model';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';

interface ResultKeyModelAttributes {
  id?: number;
  name: string;
  initial_value: number;
  target_value: number;
  current_value: number;
  unit: string;
  responsible_users?: number[] | null;
  responsible_team_id?: number | null;
  id_okr?: number | null;
  status: string; //'active' | 'completed' | 'cancelled';
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
}

class ResultKeyModel
  extends Model<ResultKeyModelAttributes>
  implements ResultKeyModelAttributes
{
  declare id?: number;
  declare name: string;
  declare initial_value: number;
  declare target_value: number;
  declare current_value: number;
  declare unit: string;
  declare responsible_users?: number[] | null;
  declare responsible_team_id?: number | null;
  declare id_okr?: number | null;
  declare status: string; //'active' | 'completed' | 'cancelled';
  declare created_at?: Date;
  declare updated_at?: Date;
  declare deleted_at?: Date;

  // Métodos auxiliares para validação
  public isResponsibleUsersValid(): boolean {
    return !!(
      this.responsible_users &&
      this.responsible_users.length > 0 &&
      !this.responsible_team_id
    );
  }

  public isResponsibleTeamValid(): boolean {
    return !!(
      this.responsible_team_id &&
      (!this.responsible_users || this.responsible_users.length === 0)
    );
  }

  public getProgressPercentage(): number {
    if (this.target_value === 0) return 0;
    return Math.min(
      100,
      Math.max(
        0,
        ((this.current_value - this.initial_value) /
          (this.target_value - this.initial_value)) *
          100
      )
    );
  }
}

ResultKeyModel.init(
  {
    id: {
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
      type: DataTypes.BIGINT
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    initial_value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    target_value: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    current_value: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    },
    unit: {
      type: DataTypes.STRING(10),
      allowNull: false
    },
    responsible_users: {
      type: DataTypes.JSON,
      allowNull: true,
      validate: {
        isValidResponsibleUsers(value: number[] | null) {
          if (value && this.responsible_team_id) {
            throw new Error(
              'Não é possível ter responsible_users e responsible_team_id ao mesmo tempo'
            );
          }
          if (
            value &&
            (!Array.isArray(value) ||
              value.some((id) => typeof id !== 'number'))
          ) {
            throw new Error('responsible_users deve ser um array de números');
          }
        }
      }
    },
    responsible_team_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: TeamModel, key: 'id' },
      validate: {
        isValidResponsibleTeam(value: number | null) {
          if (
            value &&
            this.responsible_users &&
            this.responsible_users.length > 0
          ) {
            throw new Error(
              'Não é possível ter responsible_team_id e responsible_users ao mesmo tempo'
            );
          }
        }
      }
    },
    id_okr: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: ObjectiveModel, key: 'id' }
    },
    status: {
      type: DataTypes.STRING, //('active', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'active'
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
    modelName: 'ResultKey',
    tableName: 'results_keys',
    timestamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at'
    // validate: {
    //   // Validação global para garantir que apenas um campo de responsabilidade seja preenchido
    //   responsibilityExclusivity() {
    //     const hasResponsibleUsers =
    //       this.responsible_users && this.responsible_users.length > 0;
    //     const hasResponsibleTeam = !!this.responsible_team_id;

    //     if (!hasResponsibleUsers && !hasResponsibleTeam) {
    //       throw new Error(
    //         'É necessário definir responsável(is): responsible_users ou responsible_team_id'
    //       );
    //     }

    //     if (hasResponsibleUsers && hasResponsibleTeam) {
    //       throw new Error(
    //         'Não é possível ter responsible_users e responsible_team_id ao mesmo tempo'
    //       );
    //     }
    //   }
    // }
  }
);

// Definindo associações
ResultKeyModel.belongsTo(TeamModel, {
  foreignKey: 'responsible_team_id',
  as: 'responsibleTeam'
});

ResultKeyModel.belongsTo(ObjectiveModel, {
  foreignKey: 'id_okr',
  as: 'objective'
});

// Associações inversas
TeamModel.hasMany(ResultKeyModel, {
  foreignKey: 'responsible_team_id',
  as: 'resultKeys'
});

ObjectiveModel.hasMany(ResultKeyModel, {
  foreignKey: 'id_okr',
  as: 'resultKeys'
});

export default ResultKeyModel;
