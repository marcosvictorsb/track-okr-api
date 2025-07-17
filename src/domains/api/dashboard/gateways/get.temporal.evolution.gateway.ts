import {
  GetTemporalEvolutionGatewayDependencies,
  IGetTemporalEvolutionGateway,
  FindObjectivesByCompanyAndQuarterCriteria,
  FindResultKeyUpdatesByCriteria
} from '../interfaces/get.temporal.evolution.interface';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { IObjectiveRepository } from '@domains/api/objectives/interfaces';
import { IResultKeyRepository } from '@domains/api/results-keys';
import { IResultKeyUpdateRepository } from '@domains/api/results-keys/interfaces/result-key-update.interface';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import { ResultKeyEntity } from '@domains/api/results-keys/entity/result-key.entity';
import { ResultKeyUpdateEntity } from '@domains/api/results-keys/entity/result-key-update.entity';
import { logger } from '@configs/logger';
import { DataLogOutput } from '@adapters/services';

export class GetTemporalEvolutionGateway
  implements IGetTemporalEvolutionGateway
{
  teamRepository: ITeamRepository;
  objectiveRepository: IObjectiveRepository;
  resultKeyRepository: IResultKeyRepository;
  resultKeyUpdateRepository: IResultKeyUpdateRepository;
  logging: typeof logger;

  constructor(params: GetTemporalEvolutionGatewayDependencies) {
    this.teamRepository = params.teamRepository;
    this.objectiveRepository = params.objectiveRepository;
    this.resultKeyRepository = params.resultKeyRepository;
    this.resultKeyUpdateRepository = params.resultKeyUpdateRepository;
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
      year: criteria.year
    });
  }

  async findResultKeysByObjectiveIds(
    objectiveIds: number[]
  ): Promise<ResultKeyEntity[]> {
    this.logging.info('Buscando result keys por IDs de objetivos', {
      objectiveIds
    });

    const resultKeys: ResultKeyEntity[] = [];

    for (const objectiveId of objectiveIds) {
      const keys = await this.resultKeyRepository.findMany({
        id_okr: objectiveId
      });
      resultKeys.push(...keys);
    }

    return resultKeys;
  }

  async findResultKeyUpdatesByIds(
    criteria: FindResultKeyUpdatesByCriteria
  ): Promise<ResultKeyUpdateEntity[]> {
    this.logging.info('Buscando atualizações de result keys', {
      resultKeyIds: criteria.resultKeyIds,
      startDate: criteria.startDate,
      endDate: criteria.endDate
    });

    const allUpdates: ResultKeyUpdateEntity[] = [];

    for (const resultKeyId of criteria.resultKeyIds) {
      const updates = await this.resultKeyUpdateRepository.findMany({
        id_result_key: resultKeyId
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

      allUpdates.push(...filteredUpdates);
    }

    return allUpdates;
  }

  loggerInfo(message: string, data?: DataLogOutput): void {
    this.logging.info(message, data);
  }

  loggerError(message: string, data?: DataLogOutput): void {
    this.logging.error(message, data);
  }
}
