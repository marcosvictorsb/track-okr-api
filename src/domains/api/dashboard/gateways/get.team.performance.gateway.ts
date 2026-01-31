import { MixGetOverviewGateway } from '@adapters/gateways/api/dashboard';
import { logger } from '@configs/logger';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import { IObjectiveRepository } from '@domains/api/objectives/interfaces';
import {
  IResultKeyRepository,
  ResultKeyEntity
} from '@domains/api/results-keys';
import { TeamEntity } from '@domains/api/teams/entity/team.entity';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import {
  FindTeamObjectivesCriteria,
  FindTeamsWithObjectivesCriteria,
  GetTeamPerformanceGatewayDependencies,
  IGetTeamPerformanceGateway
} from '../interfaces/get.team.performance.interface';

export class GetTeamPerformanceGateway
  extends MixGetOverviewGateway
  implements IGetTeamPerformanceGateway
{
  teamRepository: ITeamRepository;
  objectiveRepository: IObjectiveRepository;
  resultKeyRepository: IResultKeyRepository;
  logging: typeof logger;

  constructor(params: GetTeamPerformanceGatewayDependencies) {
    super(params);
    this.teamRepository = params.teamRepository;
    this.objectiveRepository = params.objectiveRepository;
    this.resultKeyRepository = params.resultKeyRepository;
    this.logging = params.logging;
  }

  async findTeamsWithObjectives(
    criteria: FindTeamsWithObjectivesCriteria
  ): Promise<TeamEntity[]> {
    this.logging.info('Buscando times com objetivos', { criteria });

    return await this.teamRepository.findAll({
      id_company: criteria.id_company
    });
  }

  async findTeamObjectives(
    criteria: FindTeamObjectivesCriteria
  ): Promise<ObjectiveEntity[]> {
    this.logging.info('Buscando objetivos do time', { criteria });
    const quarter = criteria.quarter;
    const year = criteria.year;

    return await this.objectiveRepository.findMany({
      id_company: criteria.id_company,
      id_team: criteria.id_team,
      quarter,
      year
    });
  }

  async findTeamMembersCount(teamId: number): Promise<number> {
    this.logging.info('Contando membros do time', { teamId });

    const mockCounts = [12, 8, 6, 5, 4, 7, 9, 10, 3, 11];
    return mockCounts[teamId % mockCounts.length] || 5;
  }

  public async findResultKeysByObjectiveIds(
    objectiveIds: number[]
  ): Promise<ResultKeyEntity[]> {
    this.logging.info('Buscando os resultados chaves por ids', {
      ids: JSON.stringify(objectiveIds)
    });
    return await this.resultKeyRepository.findByObjectiveIds(objectiveIds);
  }
}
