import { logger } from '@configs/logger';
import { RegisterBetaController } from '@domains/api/authentication/controllers/register.beta.controller';
import { RegisterBetaGateway } from '@domains/api/authentication/gateways/register.beta.gateway';
import { IRegisterBetaGatewayDependencies } from '@domains/api/authentication/interfaces/register.beta.interface';
import { RegisterBetaInteractor } from '@domains/api/authentication/usecases/register.beta.interactor';
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

export const makeRegisterBetaController = () => {
  const params: IRegisterBetaGatewayDependencies = {
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
  const registerBetaGateway = new RegisterBetaGateway(params);
  const interactor = new RegisterBetaInteractor({
    gateway: registerBetaGateway,
    presenter,
    interactorCreateTrialSubscription: makeCreateTrialSubscriptionInteractor()
  });

  return new RegisterBetaController({
    interactor
  });
};
