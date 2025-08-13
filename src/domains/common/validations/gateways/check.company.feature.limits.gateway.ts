import { MixCheckCompanyFeatureLimits } from '@adapters/gateways/common/check.company.feature.limits.gateway';
import {
  CheckCompanyFeatureLimitsGatewayDependencies,
  ICheckCompanyFeatureLimitsGateway,
  InputGetCurrentUsage
} from '../interfaces/check.company.feature.limits.interface';
import {
  FindSubscriptionsCriteria,
  ISubscriptionRepository
} from '@domains/common/subscriptions/interfaces';
import { logger } from '@configs/logger';
import { SubscriptionEntity } from '@domains/common/subscriptions/entity/subscription.entity';
import { PlanEntity } from '@domains/api/backoffice/entities/plan.entity';
import { IPlanRepository } from '@domains/api/backoffice/interfaces/default.interfaces';
import { IPlannerRepository } from '@domains/api/planners/interfaces';

export class CheckCompanyFeatureLimitsGateway
  extends MixCheckCompanyFeatureLimits
  implements ICheckCompanyFeatureLimitsGateway
{
  subscriptionRepository: ISubscriptionRepository;
  planRepository: IPlanRepository;
  plannerRepository: IPlannerRepository;
  logging: typeof logger;

  constructor(params: CheckCompanyFeatureLimitsGatewayDependencies) {
    super(params);
    this.subscriptionRepository = params.subscriptionRepository;
    this.planRepository = params.planRepository;
    this.plannerRepository = params.plannerRepository;
    this.logging = params.logging;
  }

  async findActiveSubscriptionByCompany(
    criteria: FindSubscriptionsCriteria
  ): Promise<SubscriptionEntity | undefined> {
    this.logging.info('Buscando a assinatura', { criteria });
    return await this.subscriptionRepository.find(criteria);
  }

  async findPlan(
    criteria: FindSubscriptionsCriteria
  ): Promise<PlanEntity | undefined> {
    this.logging.info('Buscando o plano da assinatura', { criteria });
    return await this.planRepository.find(criteria);
  }

  async getCurrentUsage(criteria: InputGetCurrentUsage): Promise<number> {
    const { id_company, feature, year } = criteria;
    this.logging.info('Buscando uso atual da feature', {
      id_company,
      feature
    });

    if (feature === 'max_planners') {
      const currentUsage = await this.plannerRepository.count({
        id_company,
        year
      });

      this.logging.info('Uso atual de planner anual', {
        id_company,
        feature,
        currentUsage
      });
      return currentUsage;
    }

    return 0;
  }
}
