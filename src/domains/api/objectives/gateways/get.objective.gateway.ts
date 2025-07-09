import {
  CreateObjectiveCriteria,
  UpdateObjectiveCriteria,
  IObjectiveRepository
} from '@domains/api/objectives/interfaces/';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import { MixCreateObjectives } from '@adapters/gateways/api/objectives';
import { logger } from '@configs/logger';
import {
  FindTeamCriteria,
  ITeamRepository
} from '@domains/api/teams/interfaces';
import { TeamEntity } from '@domains/api/teams/entity/team.entity';
import {
  IGetObjectiveGateway,
  IGetObjectiveGatewayDependencies
} from '../interfaces/get.objective.interface';
import { IResultKeyRepository } from '@domains/api/results-keys/interfaces';
import { ResultKeyEntity } from '@domains/api/results-keys/entity/result-key.entity';

export class GetObjectiveGateway
  extends MixCreateObjectives
  implements IGetObjectiveGateway
{
  objectiveRepository: IObjectiveRepository;
  teamRepository: ITeamRepository;
  resultKeyRepository: IResultKeyRepository;
  logging: typeof logger;

  constructor(params: IGetObjectiveGatewayDependencies) {
    super(params);
    this.objectiveRepository = params.objectiveRepository;
    this.teamRepository = params.teamRepository;
    this.resultKeyRepository = params.resultKeyRepository;
    this.logging = params.logging;
  }

  public async create(data: CreateObjectiveCriteria): Promise<ObjectiveEntity> {
    this.logging.info('Creating new objective', { data });
    return await this.objectiveRepository.create(data);
  }

  public async findById(id: number): Promise<ObjectiveEntity | null> {
    this.logging.info('Finding objective by ID', { id });
    return await this.objectiveRepository.findOne({ id });
  }

  public async findByTeam(id_team: number): Promise<ObjectiveEntity[]> {
    this.logging.info('Finding objectives by team ID', { id_team });
    return await this.objectiveRepository.findMany({ id_team });
  }

  public async findByQuarter(
    quarter: number,
    year: number,
    id_company: number
  ): Promise<ObjectiveEntity[]> {
    this.logging.info('Finding objectives by quarter and year', {
      quarter,
      year,
      id_company
    });
    return await this.objectiveRepository.findMany({
      quarter,
      year,
      id_company
    });
  }

  public async update(
    id: number,
    data: UpdateObjectiveCriteria
  ): Promise<ObjectiveEntity | null> {
    this.logging.info('Updating objective', { id, data });
    return await this.objectiveRepository.update({ id }, data);
  }

  public async delete(id: number): Promise<boolean> {
    this.logging.info('Deleting objective', { id });
    return await this.objectiveRepository.delete({ id });
  }

  public async findTeam(criteria: FindTeamCriteria): Promise<TeamEntity[]> {
    this.logging.info('Finding teams by IDs', { criteria });
    return await this.teamRepository.findAll(criteria);
  }

  public async findResultKeysByObjectiveIds(
    objectiveIds: number[]
  ): Promise<ResultKeyEntity[]> {
    this.logging.info('Finding result keys by objective IDs', { objectiveIds });
    return await this.resultKeyRepository.findByObjectiveIds(objectiveIds);
  }
}
