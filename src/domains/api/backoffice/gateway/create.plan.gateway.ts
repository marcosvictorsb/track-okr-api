import { PlanEntity } from '../entities/plan.entity';
import { MixCreatePlan } from '@adapters/gateways/api/plan';
import { logger } from '@configs/logger';
import {
  CreatePlanCriteria,
  FindPlansCriteria,
  IPlanRepository
} from '../interfaces/default.interfaces';
import {
  ICreatePlanGateway,
  ICreatePlanGatewayDependencies
} from '../interfaces/create.plan.interfaces';

export class CreatePlanGateway
  extends MixCreatePlan
  implements ICreatePlanGateway
{
  planRepository: IPlanRepository;
  logging: typeof logger;

  constructor(params: ICreatePlanGatewayDependencies) {
    super(params);
    this.planRepository = params.planRepository;
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
}
