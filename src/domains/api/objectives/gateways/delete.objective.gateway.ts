import {
  IObjectiveRepository,
  IDeleteObjectiveGateway,
  IDeleteObjectiveGatewayDependencies,
  FindObjectiveCriteria
} from '@domains/api/objectives/interfaces/';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import { MixCreateObjectives } from '@adapters/gateways/api/objectives';
import { logger } from '@configs/logger';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import {
  DeleteResultKeyCriteria,
  FindResultKeyCriteria,
  IResultKeyRepository,
  ResultKeyEntity
} from '@domains/api/results-keys';
import {
  DeleteCheckinsCriteria,
  FindCheckinsCriteria,
  ICheckinsRepository
} from '@domains/api/checkins/interfaces';
import { CheckinsEntity } from '@domains/api/checkins/entity/checkins.entity';

export class DeleteObjectiveGateway
  extends MixCreateObjectives
  implements IDeleteObjectiveGateway
{
  objectiveRepository: IObjectiveRepository;
  resultKeyRepository: IResultKeyRepository;
  teamRepository: ITeamRepository;
  checkinsRepository: ICheckinsRepository;
  logging: typeof logger;

  constructor(params: IDeleteObjectiveGatewayDependencies) {
    super(params);
    this.objectiveRepository = params.objectiveRepository;
    this.resultKeyRepository = params.resultKeyRepository;
    this.checkinsRepository = params.checkinsRepository;
    this.logging = params.logging;
  }

  public async findObjetive(
    criteria: FindObjectiveCriteria
  ): Promise<ObjectiveEntity | null> {
    this.logging.info('Buscando objetivo com critérios', { criteria });
    return this.objectiveRepository.findOne(criteria);
  }

  public async findResultkeysByObjective(
    criteria: FindResultKeyCriteria
  ): Promise<ResultKeyEntity[]> {
    this.logging.info('Buscando resultados-chave do objetivo', { criteria });
    return await this.resultKeyRepository.findMany(criteria);
  }

  public async delete(id: number): Promise<boolean> {
    this.logging.info('Deletando objetivo', { id });
    return await this.objectiveRepository.delete({ id });
  }

  public async deleteResultKeys(
    criteria: DeleteResultKeyCriteria
  ): Promise<boolean> {
    this.logging.info('Deletando resultados-chave com critérios', { criteria });
    return await this.resultKeyRepository.delete(criteria);
  }

  public async findCheckins(
    criteria: FindCheckinsCriteria
  ): Promise<CheckinsEntity[]> {
    this.logging.info('Buscando check-ins com critérios', { criteria });
    return await this.checkinsRepository.findMany(criteria);
  }

  public async deleteChekins(
    criteria: DeleteCheckinsCriteria
  ): Promise<boolean> {
    this.logging.info('Deletando check-ins com critérios', { criteria });
    return await this.checkinsRepository.delete(criteria);
  }
}
