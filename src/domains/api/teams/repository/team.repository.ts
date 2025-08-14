import TeamModel from '@domains/api/teams/model/team.model';
import { TeamEntity } from '@domains/api/teams/entity/team.entity';
import { ModelStatic, Op } from 'sequelize';
import {
  CreateTeamCriteria,
  DeleteTeamCriteria,
  FindTeamCriteria,
  ITeamRepository,
  UpdateTeamCriteria,
  TeamRepositoryDependencies
} from '@domains/api/teams/interfaces';

export class TeamRepository implements ITeamRepository {
  protected model: ModelStatic<TeamModel>;

  constructor(params: TeamRepositoryDependencies) {
    this.model = params.model;
  }

  private getConditions(criteria: FindTeamCriteria): Record<string, unknown> {
    const whereConditions: Record<string, unknown> = {};

    if (criteria.id) {
      whereConditions['id'] = criteria.id;
    }

    if (criteria.ids && criteria.ids.length > 0) {
      whereConditions['id'] = { [Op.in]: criteria.ids };
    }

    if (criteria.name) {
      whereConditions['name'] = criteria.name;
    }

    if (criteria.description) {
      whereConditions['description'] = criteria.description;
    }

    if (criteria.amount_users !== undefined) {
      whereConditions['amount_users'] = criteria.amount_users;
    }

    if (criteria.id_company) {
      whereConditions['id_company'] = criteria.id_company;
    }

    return whereConditions;
  }

  public async create(criteria: CreateTeamCriteria): Promise<TeamEntity> {
    const team = await this.model.create(criteria);
    return new TeamEntity(team.dataValues);
  }

  public async find(
    criteria: FindTeamCriteria
  ): Promise<TeamEntity | undefined> {
    const team = await this.model.findOne({
      where: this.getConditions(criteria),
      raw: true
    });

    if (!team) return undefined;

    return new TeamEntity(team);
  }

  public async findAll(criteria: FindTeamCriteria): Promise<TeamEntity[]> {
    const queryOptions: {
      where: Record<string, unknown>;
      raw: boolean;
      limit?: number;
    } = {
      where: this.getConditions(criteria),
      raw: true
    };

    if (criteria.limite) {
      queryOptions.limit = criteria.limite;
    }

    const teams = await this.model.findAll(queryOptions);

    if (!teams || teams.length === 0) return [];

    return teams.map(
      (team) =>
        new TeamEntity({
          id: team.id,
          name: team.name,
          description: team.description,
          amount_users: team.amount_users,
          id_company: team.id_company,
          created_at: team.created_at
        })
    );
  }

  public async update(
    data: Partial<UpdateTeamCriteria>,
    criteria: UpdateTeamCriteria
  ): Promise<boolean> {
    const [affectedRows] = await this.model.update(data, {
      where: { id: criteria.id }
    });
    if (affectedRows === 0) return false;
    return true;
  }

  public async delete(criteria: DeleteTeamCriteria): Promise<boolean> {
    const affectedRows = await this.model.destroy({
      where: { id: criteria.id }
    });
    return affectedRows > 0;
  }

  public async countTeams(criteria: FindTeamCriteria): Promise<number> {
    const whereConditions = this.getConditions(criteria);
    return this.model.count({ where: whereConditions });
  }
}
