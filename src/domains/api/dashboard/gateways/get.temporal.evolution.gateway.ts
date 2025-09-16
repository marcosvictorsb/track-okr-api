import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { CheckinsEntity } from '@domains/api/checkins/entity/checkins.entity';
import { ICheckinsRepository } from '@domains/api/checkins/interfaces/default.interface';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import { IObjectiveRepository } from '@domains/api/objectives/interfaces';
import { IResultKeyRepository } from '@domains/api/results-keys';
import { ResultKeyEntity } from '@domains/api/results-keys/entity/result-key.entity';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import {
  FindCheckinsByCriteria,
  FindObjectivesByCompanyAndQuarterCriteria,
  GetTemporalEvolutionGatewayDependencies,
  IGetTemporalEvolutionGateway
} from '../interfaces/get.temporal.evolution.interface';

export class GetTemporalEvolutionGateway
  implements IGetTemporalEvolutionGateway
{
  teamRepository: ITeamRepository;
  objectiveRepository: IObjectiveRepository;
  resultKeyRepository: IResultKeyRepository;
  checkinsRepository: ICheckinsRepository;
  logging: typeof logger;

  constructor(params: GetTemporalEvolutionGatewayDependencies) {
    this.teamRepository = params.teamRepository;
    this.objectiveRepository = params.objectiveRepository;
    this.resultKeyRepository = params.resultKeyRepository;
    this.checkinsRepository = params.checkinsRepository;
    this.logging = params.logging;
  }

  async findObjectivesByCompanyAndQuarter(
    criteria: FindObjectivesByCompanyAndQuarterCriteria
  ): Promise<ObjectiveEntity[]> {
    this.logging.info('Buscando objetivos da empresa por trimestre', {
      criteria
    });

    return await this.objectiveRepository.findMany({
      id_company: criteria.id_company,
      quarter: criteria.quarter,
      year: criteria.year,
      statuses: ['ACTIVE', 'COMPLETED']
    });
  }

  async findResultKeysByObjectiveIds(
    objectiveIds: number[]
  ): Promise<ResultKeyEntity[]> {
    this.logging.info('Buscando result keys por IDs de objetivos', {
      objectiveIds
    });

    const keys = await this.resultKeyRepository.findMany({
      ids_okr: objectiveIds
    });

    return keys;
  }

  async findCheckinsByIds(
    criteria: FindCheckinsByCriteria
  ): Promise<CheckinsEntity[]> {
    this.logging.info('Buscando atualizações de result keys', {
      resultKeyIds: criteria.resultKeyIds,
      startDate: criteria.startDate,
      endDate: criteria.endDate
    });

    const { resultKeyIds } = criteria;

    const updates = await this.checkinsRepository.findMany({
      ids_result_key: resultKeyIds
    });

    // Filtrar por período se especificado
    let filteredUpdates = updates;
    if (criteria.startDate && criteria.endDate) {
      filteredUpdates = updates.filter((update) => {
        if (!update.created_at) return false;
        const updateDate = new Date(update.created_at);
        return (
          updateDate >= criteria.startDate! && updateDate <= criteria.endDate!
        );
      });
    }

    return filteredUpdates;
  }

  loggerInfo(message: string, data?: DataLogOutput): void {
    this.logging.info(message, data);
  }

  loggerError(message: string, data?: DataLogOutput): void {
    this.logging.error(message, data);
  }
}
