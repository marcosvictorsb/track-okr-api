import { Presenter } from '@protocols/presenter';
import { logger } from '@configs/logger';
import { WebhookRepository } from '@domains/common';
import WebhookModel from '@domains/common/webhooks/model/webhook.model';
import { KirvanoWebhookGatewayDependencies } from '../interfaces';
import { KirvanoWebhookGateway } from '../gateways';
import { KirvanoWebhookInteractor } from '../usecases';
import { KirvanoWebhookController } from '../controllers/kirvano.webhook.controller';
import { CompanyRepository } from '@domains/api/companies/repository/company.repository';
import { PlanRepository } from '@domains/api/backoffice/repository/plan.repository';
import Company from '@domains/api/companies/model/company.model';
import { PlanModel } from '@domains/api/backoffice/models/plan.model';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import UserModel from '@domains/api/users/model/user.model';
import { SettingRepository } from '@domains/api/settings';
import SettingModel from '@domains/api/settings/model';
import { SubscriptionRepository } from '@domains/common/subscriptions/repository/subscription.repository';
import SubscriptionModel from '@domains/common/subscriptions/model/subscription.model';
import { SubscriptionHistoryRepository } from '@domains/common/subscriptions/repository/subscription.history.repository';
import SubscriptionHistoryModel from '@domains/common/subscriptions/model/subscription.history.model';
import * as dotenv from 'dotenv';
import { Resend } from 'resend';
dotenv.config();

export const makeKirvanoWebhookController = () => {
  const gateway: KirvanoWebhookGatewayDependencies = {
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
    webhookRepository: new WebhookRepository({ model: WebhookModel }),
    resendService: new Resend('re_4qYe4H3f_NX5jR1LgBifDdYFSXrfVDdTP')
  };

  const kirvanoWebhookGateway = new KirvanoWebhookGateway(gateway);
  const interactor = new KirvanoWebhookInteractor({
    gateway: kirvanoWebhookGateway,
    presenter: new Presenter()
  });

  return new KirvanoWebhookController({ interactor });
};
