import { UserEntity } from '@domains/api/users/entity/user.entity';
import { PlannerEntity } from '../entity/planner.entity';
import {
  IGetPlannerGateway,
  IGetPlannerGatewayDependencies,
  FindPlannerCriteria,
  IPlannerRepository
} from '../interfaces';
import { MixGetPlanner } from '@adapters/gateways/api/planners';
import {
  FindUserCriteria,
  IUserRepository
} from '@domains/api/users/interfaces';
import { logger } from '@configs/logger';

export class GetPlannerGateway
  extends MixGetPlanner
  implements IGetPlannerGateway
{
  plannerRepository: IPlannerRepository;
  userRepository: IUserRepository;
  logging: typeof logger;

  constructor(params: IGetPlannerGatewayDependencies) {
    super(params);
    this.plannerRepository = params.plannerRepository;
    this.userRepository = params.userRepository;
    this.logging = params.logging;
  }

  async findPlanner(
    criteria: FindPlannerCriteria
  ): Promise<PlannerEntity[] | undefined> {
    this.logging.info('Iniciando busca dos planejamentos', { criteria });
    return await this.plannerRepository.findAll(criteria);
  }

  async findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined> {
    this.logging.info('Iniciando busca do usuário', { criteria });
    return await this.userRepository.find(criteria);
  }
}
