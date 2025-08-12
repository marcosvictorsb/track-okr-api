import { UserRepository } from '@domains/api/users/repository/user.repository';
import { CompanyRepository } from '@domains/api/companies/repository/company.repository';
import { SubscriptionRepository } from '@domains/common/subscriptions/repository/subscription.repository';
import { RegisterGateway } from '@domains/api/authentication/gateways/register.gateway';
import { RegisterInteractor } from '@domains/api/authentication/usecases/register.interactor';
import { RegisterController } from '@domains/api/authentication/controllers/register.controller';
import UserModel from '@domains/api/users/model/user.model';
import CompanyModel from '@domains/api/companies/model/company.model';
import SubscriptionModel from '@domains/common/subscriptions/model/subscription.model';
import { Presenter } from '@protocols/presenter';
import { IRegisterGatewayDependencies } from '@domains/api/authentication/interfaces';
import { logger } from '@configs/logger';
import { PlanModel } from '@domains/api/backoffice/models/plan.model';
import { PlanRepository } from '@domains/api/backoffice/repository/plan.repository';
import { makeCreateTrialSubscriptionInteractor } from '@domains/common/subscriptions/factories';

export const makeRegisterController = () => {
  const params: IRegisterGatewayDependencies = {
    userRepository: new UserRepository({ model: UserModel }),
    companyRepository: new CompanyRepository({ model: CompanyModel }),
    subscriptionRepository: new SubscriptionRepository({
      model: SubscriptionModel
    }),
    planRepository: new PlanRepository({ model: PlanModel }),
    logging: logger
  };

  const presenter = new Presenter();
  const registerGateway = new RegisterGateway(params);
  const interactor = new RegisterInteractor({
    gateway: registerGateway,
    presenter,
    interactorCreateTrialSubscription: makeCreateTrialSubscriptionInteractor()
  });

  return new RegisterController({
    interactor
  });
};
