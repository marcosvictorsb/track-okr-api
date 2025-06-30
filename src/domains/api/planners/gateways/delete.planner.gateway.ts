import { PlannerEntity } from '../entity/planner.entity';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  FindPlannerCriteria,
  IPlannerRepository,
  DeletePlannerCriteria
} from '../interfaces';
import {
  IUserRepository,
  FindUserCriteria
} from '@domains/api/users/interfaces/default.interfaces';
import {
  IDeletePlannerGateway,
  IDeletePlannerGatewayDependencies
} from '../interfaces/delete.planner.interface';
import { MixDeletePlanner } from '@adapters/gateways/api/planners';
import { logger } from '@configs/logger';

export class DeletePlannerGateway
  extends MixDeletePlanner
  implements IDeletePlannerGateway
{
  plannerRepository: IPlannerRepository;
  userRepository: IUserRepository;
  logging: typeof logger;

  constructor(params: IDeletePlannerGatewayDependencies) {
    super(params);
    this.plannerRepository = params.plannerRepository;
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
}
