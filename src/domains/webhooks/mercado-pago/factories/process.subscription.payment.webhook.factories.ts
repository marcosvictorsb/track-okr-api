import { ProcessSubscriptionPaymentWebhookController } from '@domains/webhooks/mercado-pago/controllers/'
import { ProcessSubscriptionPaymentWebhookInteractor } from '../usecases/process.subscription.payment.webhook.usecase';
import { Presenter } from '@protocols/presenter';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import UserModel from '@domains/api/users/model/user.model';
import { CompanyRepository } from '@domains/api/companies/repository/company.repository';
import CompanyModel from '@domains/api/companies/model/company.model';
import { SubscriptionRepository } from '@domains/api/subscriptions/repository/subscription.repository';
import SubscriptionModel from '@domains/api/subscriptions/model/subscription.model';
import { IProcessSubscriptionPaymentGatewayDependencies } from '../interfaces/process.subscription.payment.interfaces';
import { ProcessSubscriptionPaymentGateway } from '../gateways';
import { logger } from '@configs/logger';
import { sequelize } from '@infra/database/connection/mysql';

const userRepository = new UserRepository({
  model: UserModel
});
const companyRepository = new CompanyRepository({
  model: CompanyModel
});
const subscriptionRepository = new SubscriptionRepository({
  model: SubscriptionModel
});

const gatewayDependencies: IProcessSubscriptionPaymentGatewayDependencies = {
  userRepository,
  companyRepository,
  subscriptionRepository,
  logging: logger,
  sequelize
};
const gateway = new ProcessSubscriptionPaymentGateway(gatewayDependencies);
const presenter = new Presenter();
const interactor = new ProcessSubscriptionPaymentWebhookInteractor({
  presenter,
  gateway
});
export const createFeatureFlagController = new ProcessSubscriptionPaymentWebhookController({
  interactor
});
