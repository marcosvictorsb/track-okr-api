import {
  GetDashboardOverviewGatewayDependencies,
  IGetDashboardOverviewGateway,
  FindDashboardTeamCriteria,
  FindDashboardObjectiveCriteria
} from '../interfaces/get.dashboard-overview.interface';
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

export class GetDashboardOverviewGateway
  extends MixGetDashboardOverviewGateway
  implements IGetDashboardOverviewGateway
{
  teamRepository: ITeamRepository;
  objectiveRepository: IObjectiveRepository;
  resultKeyRepository: IResultKeyRepository;
  logging: typeof logger;

  constructor(params: GetDashboardOverviewGatewayDependencies) {
    super(params);
    this.teamRepository = params.teamRepository;
    this.objectiveRepository = params.objectiveRepository;
    this.resultKeyRepository = params.resultKeyRepository;
    this.logging = params.logging;
  }

  async findTeam(
    criteria: FindDashboardTeamCriteria
  ): Promise<TeamEntity | undefined> {
    this.logging.info('Iniciando busca do time', { criteria });

    if (criteria.name) {
      // Buscar por nome usando LIKE
      const teams = await this.teamRepository.findAll({
        id_company: criteria.id_company
      });

      return teams.find((team) =>
        team.name.toLowerCase().includes(criteria.name!.toLowerCase())
      );
    }

    return undefined;
  }

  async findObjectives(
    criteria: FindDashboardObjectiveCriteria
  ): Promise<ObjectiveEntity[]> {
    this.logging.info('Iniciando busca dos objetivos', { criteria });

    return await this.objectiveRepository.findMany({
      id_company: criteria.id_company,
      quarter: criteria.quarter,
      year: criteria.year,
      id_team: criteria.id_team,
      status: criteria.status
    });
  }

  async findPreviousObjectives(
    criteria: FindDashboardObjectiveCriteria
  ): Promise<ObjectiveEntity[]> {
    this.logging.info('Iniciando busca dos objetivos do período anterior', {
      criteria
    });

    return await this.objectiveRepository.findMany({
      id_company: criteria.id_company,
      quarter: criteria.quarter,
      year: criteria.year
    });
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
