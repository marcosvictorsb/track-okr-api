import { logger } from '@configs/logger';
import { PlanModel } from '@domains/api/backoffice/models/plan.model';
import { PlanRepository } from '@domains/api/backoffice/repository/plan.repository';
import SubscriptionModel from '@domains/common/subscriptions/model/subscription.model';
import { SubscriptionRepository } from '@domains/common/subscriptions/repository/subscription.repository';
import { makeCheckCompanyFeatureLimitsInteractor } from '@domains/common/validations/factories';
import { makeUserCompanyValidationInteractor } from '@domains/common/validations/factories/user.company.validation.factory';
import { Presenter } from '@protocols/presenter';
import { GetCurrentSubscriptionController } from '../controllers/get-current-subscription.controller';
import { GetCurrentSubscriptionGateway } from '../gateways/get-current-subscription.gateway';
import { IGetCurrentSubscriptionGatewayDependencies } from '../interfaces/get-current-subscription.interface';
import { GetCurrentSubscriptionInteractor } from '../usecases/get-current-subscription.interactor';

export const makeGetCurrentSubscriptionController =
  (): GetCurrentSubscriptionController => {
    const params: IGetCurrentSubscriptionGatewayDependencies = {
      logging: logger,
      subscriptionRepository: new SubscriptionRepository({
        model: SubscriptionModel
      }),
      planRepository: new PlanRepository({ model: PlanModel })
    };

    const presenter = new Presenter();
    const gateway = new GetCurrentSubscriptionGateway(params);
    const userCompanyValidator = makeUserCompanyValidationInteractor();

    const interactor = new GetCurrentSubscriptionInteractor({
      gateway,
      presenter,
      userCompanyValidator,
      checkCompanyFeatureLimits: makeCheckCompanyFeatureLimitsInteractor()
    });

    return new GetCurrentSubscriptionController({ interactor });
  };
