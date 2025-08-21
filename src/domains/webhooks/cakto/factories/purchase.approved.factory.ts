import { SubscriptionHistoryRepository } from '@domains/common/subscriptions/repository/subscription.history.repository';
import { SubscriptionRepository } from '@domains/common/subscriptions/repository/subscription.repository';
import SubscriptionHistoryModel from '@domains/common/subscriptions/model/subscription.history.model';
import { PurchaseApprovedGatewayDependencies } from '../interfaces/purchase.approved.interfaces';
import { PurchaseApprovedController } from '../controllers/purchase.approved.controller';
import { CompanyRepository } from '@domains/api/companies/repository/company.repository';
import SubscriptionModel from '@domains/common/subscriptions/model/subscription.model';
import { PurchaseApprovedInteractor } from '../usecases/purchase.approved.interactor';
import { PlanRepository } from '@domains/api/backoffice/repository/plan.repository';
import { PurchaseApprovedGateway } from '../gateways/purchase.approved.gateway';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { SettingRepository } from '@domains/api/settings/repository/setting.repository';
import { PlanModel } from '@domains/api/backoffice/models/plan.model';
import Company from '@domains/api/companies/model/company.model';
import UserModel from '@domains/api/users/model/user.model';
import SettingModel from '@domains/api/settings/model/setting.model';
import { Presenter } from '@protocols/presenter';
import { logger } from '@configs/logger';
import { WebhookRepository } from '@domains/common';
import WebhookModel from '@domains/common/webhooks/model/webhook.model';

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
