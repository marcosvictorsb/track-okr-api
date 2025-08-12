import { MixCreateTrialSubscription } from '@adapters/gateways';
import {
  CreateSubscriptionCriteria,
  ICreateTrialSubscriptionGateway,
  ICreateTrialSubscriptionGatewayDependencies,
  ISubscriptionRepository
} from '../interfaces';
import {
  FindPlansCriteria,
  IPlanRepository
} from '@domains/api/backoffice/interfaces/default.interfaces';
import { logger } from '@configs/logger';
import { PlanEntity } from '@domains/api/backoffice/entities/plan.entity';
import { SubscriptionEntity } from '../entity/subscription.entity';

export class CreateTrialSubscriptionGateway
  extends MixCreateTrialSubscription
  implements ICreateTrialSubscriptionGateway
{
  planRepository: IPlanRepository;
  subscriptionRepository: ISubscriptionRepository;
  logging: typeof logger;

  constructor(params: ICreateTrialSubscriptionGatewayDependencies) {
    super(params);
    this.planRepository = params.planRepository;
    this.subscriptionRepository = params.subscriptionRepository;
    this.logging = params.logging;
  }

  async findPlanTrial(
    criteria: FindPlansCriteria
  ): Promise<PlanEntity | undefined> {
    this.logging.info('Buscando o plano gratuito', { criteria });
    return await this.planRepository.find(criteria);
  }

  async createTrialSubscription(
    criteria: CreateSubscriptionCriteria
  ): Promise<SubscriptionEntity> {
    this.logging.info('Buscando o plano gratuito', { criteria });
    return await this.subscriptionRepository.create(criteria);
  }
}
