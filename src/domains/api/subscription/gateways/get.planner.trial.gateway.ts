import { MixGetPlannerTrial } from '@adapters/gateways/common/subscription/get.planner.trial.gateway';
import { logger } from '@configs/logger';
import { PlanEntity } from '@domains/api/backoffice/entities/plan.entity';
import {
  FindPlansCriteria,
  IPlanRepository
} from '@domains/api/backoffice/interfaces/default.interfaces';
import { SubscriptionEntity } from '@domains/common/subscriptions/entity/subscription.entity';
import { ISubscriptionRepository } from '@domains/common/subscriptions/interfaces';
import {
  IGetPlannerTrialGateway,
  IGetPlannerTrialGatewayDependencies
} from '../interfaces';

export class GetPlannerTrialGateway
  extends MixGetPlannerTrial
  implements IGetPlannerTrialGateway
{
  logging: typeof logger;
  subscriptionRepository: ISubscriptionRepository;
  planRepository: IPlanRepository;

  constructor(params: IGetPlannerTrialGatewayDependencies) {
    super(params);
    this.logging = params.logging;
    this.subscriptionRepository = params.subscriptionRepository;
    this.planRepository = params.planRepository;
  }

  async findSubscriptionByCompanyId(
    companyId: number
  ): Promise<SubscriptionEntity | undefined> {
    this.logging.info('Buscando subscription por company_id', { companyId });
    return await this.subscriptionRepository.find({ company_id: companyId });
  }

  async findPlan(criteria: FindPlansCriteria): Promise<PlanEntity | undefined> {
    this.logging.info('Buscando plano com critérios', { criteria });
    return await this.planRepository.find(criteria);
  }
}
