import { MixCreatePlanner } from '@adapters/gateways/api/planners';
import { logger } from '@configs/logger';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  FindUserCriteria,
  IUserRepository
} from '@domains/api/users/interfaces';
import { PlannerEntity } from '../entity/planner.entity';
import {
  CreatePlannerCriteria,
  FindPlannerCriteria,
  IPlannerRepository
} from '../interfaces';
import {
  ICreatePlannerGateway,
  ICreatePlannerGatewayDependencies
} from '../interfaces/create.planner.interface';

export class CreatePlannerGateway
  extends MixCreatePlanner
  implements ICreatePlannerGateway
{
  plannerRepository: IPlannerRepository;
  userRepository: IUserRepository;
  logging: typeof logger;

  constructor(params: ICreatePlannerGatewayDependencies) {
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

  async createPlanner(data: CreatePlannerCriteria): Promise<PlannerEntity> {
    this.logging.info('Criando novo planejamento', { data });
    return await this.plannerRepository.create(data);
  }

  async findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined> {
    this.logging.info('Iniciando busca do usuário', { criteria });
    return await this.userRepository.find(criteria);
  }
}
