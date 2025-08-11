import { PlanEntity } from '../entities/plan.entity';
import { MixListPlan } from '@adapters/gateways/api/plan';
import { logger } from '@configs/logger';
import { IPlanRepository } from '../interfaces/default.interfaces';
import {
  IListPlanGateway,
  ListPlanGatewayDependencies
} from '../interfaces/list.plan.interface';

export class ListPlanGateway extends MixListPlan implements IListPlanGateway {
  planRepository: IPlanRepository;
  logging: typeof logger;

  constructor(params: ListPlanGatewayDependencies) {
    super(params);
    this.planRepository = params.planRepository;
    this.logging = params.logging;
  }

  async findAllPlans(): Promise<PlanEntity[]> {
    this.logging.info('Listando todos os planos');
    return await this.planRepository.findAll();
  }
}
