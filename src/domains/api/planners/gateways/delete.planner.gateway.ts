import { MixDeletePlanner } from '@adapters/gateways/api/planners';
import { logger } from '@configs/logger';
import { IObjectiveRepository } from '@domains/api/objectives/interfaces';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  FindUserCriteria,
  IUserRepository
} from '@domains/api/users/interfaces/default.interfaces';
import { PlannerEntity } from '../entity/planner.entity';
import {
  DeletePlannerCriteria,
  FindPlannerCriteria,
  IPlannerRepository
} from '../interfaces';
import {
  IDeletePlannerGateway,
  IDeletePlannerGatewayDependencies
} from '../interfaces/delete.planner.interface';

export class DeletePlannerGateway
  extends MixDeletePlanner
  implements IDeletePlannerGateway
{
  objectiveRepository: IObjectiveRepository;
  plannerRepository: IPlannerRepository;
  userRepository: IUserRepository;
  logging: typeof logger;

  constructor(params: IDeletePlannerGatewayDependencies) {
    super(params);
    this.plannerRepository = params.plannerRepository;
    this.objectiveRepository = params.objectiveRepository;
    this.userRepository = params.userRepository;
    this.logging = params.logging;
  }

  async findPlanner(
    criteria: FindPlannerCriteria
  ): Promise<PlannerEntity | undefined> {
    this.logging.info('Buscando o planejamento', { criteria });
    return await this.plannerRepository.find(criteria);
  }

  async deletePlanner(criteria: DeletePlannerCriteria): Promise<boolean> {
    this.logging.info('Deletando o planejamento logicamente', {
      criteria
    });
    return await this.plannerRepository.delete(criteria);
  }

  async findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined> {
    this.logging.info('Iniciando busca do usuário', { criteria });
    return await this.userRepository.find(criteria);
  }

  async hasRelatedObjectives(plannerId: number): Promise<boolean> {
    this.logging.info(
      'Verificando se o planejamento possui objetivos relacionados',
      { plannerId }
    );
    const objective = await this.objectiveRepository.findOne({
      id_planner: plannerId
    });

    if (objective) {
      this.logging.info('Planejamento possui objetivos relacionados', {
        objectiveId: objective.id
      });
      return true;
    }

    this.logging.info('Planejamento não possui objetivos relacionados');
    return false;
  }
}
