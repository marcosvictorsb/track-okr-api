import { ModelStatic, Op } from 'sequelize';
import { UserTeamEntity } from '../entity/user-team.entity';
import {
  CreateUserTeamCriteria,
  DeleteUserTeamCriteria,
  FindUserTeamCriteria,
  IUserTeamRepository,
  UpdateUserTeamCriteria,
  UpdateUserTeamData,
  UserTeamRepositoryDependencies
} from '../interfaces/default.interfaces';
import UserTeamModel, {
  UserTeamModelAttributes
} from '../model/user-team.model';

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

    if (criteria.idsUser && criteria.idsUser.length > 0) {
      whereConditions['id'] = { [Op.in]: criteria.idsUser };
    }

    if (criteria.ids_users && criteria.ids_users.length > 0) {
      whereConditions['id_user'] = { [Op.in]: criteria.ids_users };
    }

    if (criteria.id_team) {
      whereConditions['id_team'] = criteria.id_team;
    }

    if (criteria.role_in_team) {
      whereConditions['role_in_team'] = criteria.role_in_team;
    }

    return whereConditions;
  }

  public async create(
    criteria: CreateUserTeamCriteria
  ): Promise<UserTeamEntity> {
    const userTeam = await this.model.create({
      ...criteria,
      role_in_team: criteria.role_in_team || 'member'
    });
    return new UserTeamEntity(userTeam.dataValues);
  }

  public async find(
    criteria: FindUserTeamCriteria
  ): Promise<UserTeamEntity | undefined> {
    const whereConditions = this.getConditions(criteria);
    whereConditions['deleted_at'] = { [Op.is]: null };

    const userTeam = await this.model.findOne({
      where: whereConditions,
      raw: true
    });

    if (!userTeam) return undefined;

    return new UserTeamEntity(userTeam);
  }

  public async findIncludingSoftDeleted(
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
    data: Partial<UpdateUserTeamData>,
    criteria: UpdateUserTeamCriteria
  ): Promise<boolean> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [affectedRows] = await this.model.update(data as any, {
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
}
