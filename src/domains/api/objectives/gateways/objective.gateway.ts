import {
  IObjectiveGateway,
  CreateObjectiveCriteria,
  UpdateObjectiveCriteria,
  IObjectiveRepository,
  ICreateObjectiveGatewayDependencies
} from '@domains/api/objectives/interfaces';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import { MixCreateObjectives } from '@adapters/gateways/api/objectives';
import { logger } from '@configs/logger';

export class ObjectiveGateway
  extends MixCreateObjectives
  implements IObjectiveGateway
{
  objectiveRepository: IObjectiveRepository;
  logging: typeof logger;

  constructor(params: ICreateObjectiveGatewayDependencies) {
    super(params);
    this.objectiveRepository = params.objectiveRepository;
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
    year: number
  ): Promise<ObjectiveEntity[]> {
    this.logging.info('Finding objectives by quarter and year', {
      quarter,
      year
    });
    return await this.objectiveRepository.findMany({ quarter, year });
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
}
