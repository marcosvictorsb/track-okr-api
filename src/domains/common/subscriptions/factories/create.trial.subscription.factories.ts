import { logger } from '@configs/logger';
import { PlanModel } from '@domains/api/backoffice/models/plan.model';
import { PlanRepository } from '@domains/api/backoffice/repository/plan.repository';
import { CreateTrialSubscriptionGateway } from '../gateways/create.trial.subscription.gateway';
import SubscriptionModel from '../model/subscription.model';
import { SubscriptionRepository } from '../repository/subscription.repository';
import { CreateTrialSubscriptionInteractor } from '../usecases/create.trial.subscription.interactor';

export const makeCreateTrialSubscriptionInteractor = () => {
  const planRepository = new PlanRepository({
    model: PlanModel
  });

  const subscriptionRepository = new SubscriptionRepository({
    model: SubscriptionModel
  });

  const paramsGateway = {
    planRepository,
    subscriptionRepository,
    logging: logger
  };
  const createTrialSubscriptionGateway = new CreateTrialSubscriptionGateway(
    paramsGateway
  );

  return new CreateTrialSubscriptionInteractor({
    gateway: createTrialSubscriptionGateway
  });
};
