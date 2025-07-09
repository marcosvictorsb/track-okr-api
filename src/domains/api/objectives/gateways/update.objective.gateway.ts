import {
  UpdateObjectiveCriteria,
  IObjectiveRepository,
  IUpdateObjectiveGateway,
  FindObjectiveCriteria
} from '@domains/api/objectives/interfaces';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import { MixUpdateObjectives } from '@adapters/gateways/api/objectives';
import { logger } from '@configs/logger';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { ICreateObjectiveGatewayDependencies } from '../interfaces/create.objective.interface';

export class UpdateObjectiveGateway
  extends MixUpdateObjectives
  implements IUpdateObjectiveGateway
{
  objectiveRepository: IObjectiveRepository;
  teamRepository: ITeamRepository;
  logging: typeof logger;

  constructor(params: ICreateObjectiveGatewayDependencies) {
    super(params);
    this.objectiveRepository = params.objectiveRepository;
    this.teamRepository = params.teamRepository;
    this.logging = params.logging;
  }

  public async findObjective(
    criteria: FindObjectiveCriteria
  ): Promise<ObjectiveEntity | null> {
    this.logging.info('Finding objective by ID', {
      request: JSON.stringify(criteria)
    });
    return await this.objectiveRepository.findOne(criteria);
  }

  public async update(
    id: number,
    data: UpdateObjectiveCriteria
  ): Promise<ObjectiveEntity | null> {
    this.logging.info('Updating objective', { id, data });
    return await this.objectiveRepository.update({ id }, data);
  }
}
