import { logger } from '@configs/logger';
import { PlanModel } from '@domains/api/backoffice/models/plan.model';
import { PlanRepository } from '@domains/api/backoffice/repository/plan.repository';
import SubscriptionModel from '@domains/common/subscriptions/model/subscription.model';
import { SubscriptionRepository } from '@domains/common/subscriptions/repository/subscription.repository';
import { makeUserCompanyValidationInteractor } from '@domains/common/validations/factories/user.company.validation.factory';
import { Presenter } from '@protocols/presenter';
import { GetPlannerTrialController } from '../controllers/get.planner.trial.controller';
import { GetPlannerTrialGateway } from '../gateways/get.planner.trial.gateway';
import { IGetPlannerTrialGatewayDependencies } from '../interfaces';
import { GetPlannerTrialInteractor } from '../usecases/get.planner.trial.interactor';

export const makeGetPlannerTrialController = (): GetPlannerTrialController => {
  const params: IGetPlannerTrialGatewayDependencies = {
    logging: logger,
    subscriptionRepository: new SubscriptionRepository({
      model: SubscriptionModel
    }),
    planRepository: new PlanRepository({ model: PlanModel })
  };

  const presenter = new Presenter();
  const gateway = new GetPlannerTrialGateway(params);
  const userCompanyValidator = makeUserCompanyValidationInteractor();

  const interactor = new GetPlannerTrialInteractor({
    gateway,
    presenter,
    userCompanyValidator
  });

  return new GetPlannerTrialController({ interactor });
};
