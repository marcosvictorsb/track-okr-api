import { logger } from '@configs/logger';
import { RegisterController } from '@domains/api/authentication/controllers/register.free.trial.controller';
import { RegisterGateway } from '@domains/api/authentication/gateways/register.free.trial.gateway';
import { IRegisterFreeTrialGatewayDependencies } from '@domains/api/authentication/interfaces';
import { RegisterFreeTrialInteractor } from '@domains/api/authentication/usecases/register.free.trial.interactor';
import { PlanModel } from '@domains/api/backoffice/models/plan.model';
import { PlanRepository } from '@domains/api/backoffice/repository/plan.repository';
import CompanyModel from '@domains/api/companies/model/company.model';
import { CompanyRepository } from '@domains/api/companies/repository/company.repository';
import UserModel from '@domains/api/users/model/user.model';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { makeCreateTrialSubscriptionInteractor } from '@domains/common/subscriptions/factories';
import SubscriptionModel from '@domains/common/subscriptions/model/subscription.model';
import { SubscriptionRepository } from '@domains/common/subscriptions/repository/subscription.repository';
import { Presenter } from '@protocols/presenter';
import { Resend } from 'resend';

export const makeRegisterFreeTrialController = () => {
  const params: IRegisterFreeTrialGatewayDependencies = {
    userRepository: new UserRepository({ model: UserModel }),
    companyRepository: new CompanyRepository({ model: CompanyModel }),
    subscriptionRepository: new SubscriptionRepository({
      model: SubscriptionModel
    }),
    planRepository: new PlanRepository({ model: PlanModel }),
    resendService: new Resend(process.env.API_KEY_RESEND as string),
    logging: logger
  };

  const presenter = new Presenter();
  const registerGateway = new RegisterGateway(params);
  const interactor = new RegisterFreeTrialInteractor({
    gateway: registerGateway,
    presenter,
    interactorCreateTrialSubscription: makeCreateTrialSubscriptionInteractor()
  });

  return new RegisterController({
    interactor
  });
};
