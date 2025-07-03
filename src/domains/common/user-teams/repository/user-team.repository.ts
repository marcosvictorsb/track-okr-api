import UserTeamModel, {
  UserTeamModelAttributes
} from '../model/user-team.model';
import { UserTeamEntity } from '../entity/user-team.entity';
import { ModelStatic } from 'sequelize';
import {
  CreateUserTeamCriteria,
  DeleteUserTeamCriteria,
  FindUserTeamCriteria,
  IUserTeamRepository,
  UpdateUserTeamCriteria,
  UserTeamRepositoryDependencies
} from '../interfaces/default.interfaces';

export class UserTeamRepository implements IUserTeamRepository {
  protected model: ModelStatic<UserTeamModel>;

  constructor(params: UserTeamRepositoryDependencies) {
    this.model = params.model;
  }

  private getConditions(
    criteria: FindUserTeamCriteria
  ): Record<string, unknown> {
    const whereConditions: Record<string, unknown> = {};

    if (criteria.id) {
      whereConditions['id'] = criteria.id;
    }

    if (criteria.id_user) {
      whereConditions['id_user'] = criteria.id_user;
    }

    if (criteria.id_team) {
      whereConditions['id_team'] = criteria.id_team;
    }

    if (criteria.role_in_team) {
      whereConditions['role_in_team'] = criteria.role_in_team;
    }

    if (criteria.left_at !== undefined) {
      whereConditions['left_at'] = criteria.left_at;
    }

    return whereConditions;
  }

  public async create(
    criteria: CreateUserTeamCriteria
  ): Promise<UserTeamEntity> {
    const userTeam = await this.model.create({
      ...criteria,
      joined_at: criteria.joined_at || new Date(),
      role_in_team: criteria.role_in_team || 'member'
    });
    return new UserTeamEntity(userTeam.dataValues);
  }

  public async find(
    criteria: FindUserTeamCriteria
  ): Promise<UserTeamEntity | undefined> {
    const userTeam = await this.model.findOne({
      where: this.getConditions(criteria),
      raw: true
    });

    if (!userTeam) return undefined;

    return new UserTeamEntity(userTeam);
  }

  public async findAll(
    criteria: FindUserTeamCriteria
  ): Promise<UserTeamEntity[]> {
    const userTeams = await this.model.findAll({
      where: this.getConditions(criteria),
      raw: true
    });

    if (!userTeams || userTeams.length === 0) return [];

    return userTeams.map(
      (userTeam: UserTeamModelAttributes) => new UserTeamEntity(userTeam)
    );
  }

  public async update(
    data: Partial<UpdateUserTeamCriteria>,
    criteria: UpdateUserTeamCriteria
  ): Promise<boolean> {
    const [affectedRows] = await this.model.update(data, {
      where: this.getConditions(criteria)
    });
    return affectedRows > 0;
  }

  public async delete(criteria: DeleteUserTeamCriteria): Promise<boolean> {
    const affectedRows = await this.model.destroy({
      where: this.getConditions(criteria)
    });
    return affectedRows > 0;
  }

  // Métodos específicos para user-teams

  public async findActiveTeamsByUser(
    id_user: number
  ): Promise<UserTeamEntity[]> {
    const userTeams = await this.model.findAll({
      where: {
        id_user,
        left_at: null
      } as any,
      raw: true
    });

    return userTeams.map(
      (userTeam: UserTeamModelAttributes) => new UserTeamEntity(userTeam)
    );
  }

  public async findActiveUsersByTeam(
    id_team: number
  ): Promise<UserTeamEntity[]> {
    const userTeams = await this.model.findAll({
      where: {
        id_team,
        left_at: null
      } as any,
      raw: true
    });

    return userTeams.map(
      (userTeam: UserTeamModelAttributes) => new UserTeamEntity(userTeam)
    );
  }

  public async leaveTeam(id_user: number, id_team: number): Promise<boolean> {
    const [affectedRows] = await this.model.update(
      { left_at: new Date() },
      {
        where: {
          id_user,
          id_team,
          left_at: null
        } as any
      }
    );
    return affectedRows > 0;
  }
}
