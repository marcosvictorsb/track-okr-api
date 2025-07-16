import {
  GetTeamPerformanceGatewayDependencies,
  IGetTeamPerformanceGateway,
  FindTeamsWithObjectivesCriteria,
  FindTeamObjectivesCriteria
} from '../interfaces/get.team.performance.interface';
import { MixGetDashboardOverviewGateway } from '@adapters/gateways/api/dashboard';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { IObjectiveRepository } from '@domains/api/objectives/interfaces';
import {
  IResultKeyRepository,
  ResultKeyEntity
} from '@domains/api/results-keys';
import { TeamEntity } from '@domains/api/teams/entity/team.entity';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import { logger } from '@configs/logger';

export class GetTeamPerformanceGateway
  extends MixGetDashboardOverviewGateway
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

    const currentDate = new Date();
    const quarter =
      criteria.quarter || Math.ceil((currentDate.getMonth() + 1) / 3);
    const year = criteria.year || currentDate.getFullYear();

    return await this.objectiveRepository.findMany({
      id_company: criteria.id_company,
      id_team: criteria.id_team,
      quarter,
      year
    });
  }

  async findTeamMembersCount(teamId: number): Promise<number> {
    this.logging.info('Contando membros do time', { teamId });

    // TODO: Implementar busca real de membros quando houver relação team-user
    // Por enquanto retornando um valor simulado baseado no id do time
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
