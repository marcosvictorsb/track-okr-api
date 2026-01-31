import { logger } from '@configs/logger';
import { PlanModel } from '@domains/api/backoffice/models/plan.model';
import { PlanRepository } from '@domains/api/backoffice/repository/plan.repository';
import Company from '@domains/api/companies/model/company.model';
import { CompanyRepository } from '@domains/api/companies/repository/company.repository';
import SettingModel from '@domains/api/settings/model/setting.model';
import { SettingRepository } from '@domains/api/settings/repository/setting.repository';
import UserModel from '@domains/api/users/model/user.model';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { WebhookRepository } from '@domains/common';
import SubscriptionHistoryModel from '@domains/common/subscriptions/model/subscription.history.model';
import SubscriptionModel from '@domains/common/subscriptions/model/subscription.model';
import { SubscriptionHistoryRepository } from '@domains/common/subscriptions/repository/subscription.history.repository';
import { SubscriptionRepository } from '@domains/common/subscriptions/repository/subscription.repository';
import WebhookModel from '@domains/common/webhooks/model/webhook.model';
import { Presenter } from '@protocols/presenter';
import { PurchaseApprovedController } from '../controllers/purchase.approved.controller';
import { PurchaseApprovedGateway } from '../gateways/purchase.approved.gateway';
import { PurchaseApprovedGatewayDependencies } from '../interfaces/purchase.approved.interfaces';
import { PurchaseApprovedInteractor } from '../usecases/purchase.approved.interactor';

export const makePurchaseApprovedController = () => {
  const gateway: PurchaseApprovedGatewayDependencies = {
    logging: logger,
    userRepository: new UserRepository({ model: UserModel }),
    companyRepository: new CompanyRepository({ model: Company }),
    planRepository: new PlanRepository({ model: PlanModel }),
    subscriptionRepository: new SubscriptionRepository({
      model: SubscriptionModel
    }),
    subscriptionHistoryRepository: new SubscriptionHistoryRepository({
      model: SubscriptionHistoryModel
    }),
    settingRepository: new SettingRepository({ model: SettingModel }),
    webhookRepository: new WebhookRepository({ model: WebhookModel })
  };

  const purchaseApprovedGateway = new PurchaseApprovedGateway(gateway);
  const interactor = new PurchaseApprovedInteractor({
    gateway: purchaseApprovedGateway,
    presenter: new Presenter()
  });

  return new PurchaseApprovedController({ interactor });
};
