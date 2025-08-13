import { logger } from '@configs/logger';
import { PlanModel } from '@domains/api/backoffice/models/plan.model';
import { PlanRepository } from '@domains/api/backoffice/repository/plan.repository';
import PlannerModel from '@domains/api/planners/model/planner.model';
import { PlannerRepository } from '@domains/api/planners/repository/planner.repository';
import SubscriptionModel from '@domains/common/subscriptions/model/subscription.model';
import { SubscriptionRepository } from '@domains/common/subscriptions/repository/subscription.repository';
import { CheckCompanyFeatureLimitsGateway } from '../gateways/check.company.feature.limits.gateway';
import { CheckCompanyFeatureLimitsInteractor } from '../usecases/check.company.feature.limits.interactor';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';
import { ObjectiveRepository } from '@domains/api/objectives/repository/objective.repository';

export const makeCheckCompanyFeatureLimitsInteractor = () => {
  const paramsGateway = {
    subscriptionRepository: new SubscriptionRepository({
      model: SubscriptionModel
    }),
    planRepository: new PlanRepository({ model: PlanModel }),
    plannerRepository: new PlannerRepository({ model: PlannerModel }),
    objectiveRepository: new ObjectiveRepository({ model: ObjectiveModel }),
    logging: logger
  };

  const gateway = new CheckCompanyFeatureLimitsGateway(paramsGateway);
  const paramsInteractor = {
    gateway
  };
  return new CheckCompanyFeatureLimitsInteractor(paramsInteractor);
};
