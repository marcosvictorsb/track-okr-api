import {
  CreateUserCriteria,
  FindUserCriteria,
  IUserRepository
} from '@domains/api/users/interfaces';
import { PlanEntity } from '../entities/plan.entity';
import { MixCreatePlan } from '@adapters/gateways/api/plan';
import { logger } from '@configs/logger';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  CreatePlanCriteria,
  FindPlansCriteria,
  ICreatePlanGateway,
  ICreatePlanGatewayDependencies,
  IPlanRepository
} from '../interfaces/default.interfaces';

export class CreatePlanGateway
  extends MixCreatePlan
  implements ICreatePlanGateway
{
  planRepository: IPlanRepository;
  userRepository: IUserRepository;
  logging: typeof logger;

  constructor(params: ICreatePlanGatewayDependencies) {
    super(params);
    this.planRepository = params.planRepository;
    this.userRepository = params.userRepository;
    this.logging = params.logging;
  }

  async findPlan(criteria: FindPlansCriteria): Promise<PlanEntity | undefined> {
    this.logging.info('Buscando o planejamento', { criteria });
    return await this.planRepository.find(criteria);
  }

  async createPlan(data: CreatePlanCriteria): Promise<PlanEntity> {
    this.logging.info('Criando novo planejamento', { data });
    return await this.planRepository.create(data);
  }

  async findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined> {
    this.logging.info('Iniciando busca do usuário', { criteria });
    return await this.userRepository.find(criteria);
  }

  async createUser(data: CreateUserCriteria): Promise<UserEntity | undefined> {
    this.logging.info('Criando usuário', { data });
    return await this.userRepository.create(data);
  }
}
