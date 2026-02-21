import { DiscordNotificationService } from '@adapters/services';
import { logger } from '@configs/logger';
import { PlanModel } from '@domains/api/backoffice/models/plan.model';
import { PlanRepository } from '@domains/api/backoffice/repository/plan.repository';
import Company from '@domains/api/companies/model/company.model';
import { CompanyRepository } from '@domains/api/companies/repository/company.repository';
import { SettingRepository } from '@domains/api/settings';
import SettingModel from '@domains/api/settings/model';
import UserModel from '@domains/api/users/model/user.model';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { WebhookRepository } from '@domains/common';
import SubscriptionHistoryModel from '@domains/common/subscriptions/model/subscription.history.model';
import SubscriptionModel from '@domains/common/subscriptions/model/subscription.model';
import { SubscriptionHistoryRepository } from '@domains/common/subscriptions/repository/subscription.history.repository';
import { SubscriptionRepository } from '@domains/common/subscriptions/repository/subscription.repository';
import WebhookModel from '@domains/common/webhooks/model/webhook.model';
import { Presenter } from '@protocols/presenter';
import * as dotenv from 'dotenv';
import { Resend } from 'resend';
import { KirvanoWebhookController } from '../controllers/kirvano.webhook.controller';
import { KirvanoWebhookGateway } from '../gateways';
import { KirvanoWebhookGatewayDependencies } from '../interfaces';
import { KirvanoWebhookInteractor } from '../usecases';
dotenv.config();

export const makeKirvanoWebhookController = () => {
  const discordWebhookUrl = process.env.DISCORD_NOTIFICATION_WEBHOOK;
  const discordNotificationService = discordWebhookUrl
    ? new DiscordNotificationService(discordWebhookUrl)
    : new DiscordNotificationService('');

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
    resendService: new Resend(process.env.API_KEY_RESEND as string),
    discordNotificationService
  };

  const kirvanoWebhookGateway = new KirvanoWebhookGateway(gateway);
  const interactor = new KirvanoWebhookInteractor({
    gateway: kirvanoWebhookGateway,
    presenter: new Presenter()
  });

  return new KirvanoWebhookController({ interactor });
};
