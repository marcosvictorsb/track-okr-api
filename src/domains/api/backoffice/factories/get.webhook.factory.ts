import { WebhookRepository } from '@domains/common/webhooks/repository/webhook.repository';
import { GetWebhookGateway } from '../gateway/get.webhook.gateway';
import { GetWebhookInteractor } from '../usecases/get.webhook.interactor';
import { GetWebhookController } from '../controllers/get.webhook.controller';
import WebhookModel from '@domains/common/webhooks/model/webhook.model';
import { logger } from '@configs/logger';
import { Presenter } from '@protocols/presenter';

// Repository
const webhookRepository = new WebhookRepository({
  model: WebhookModel
});

// Gateway
const getWebhookGateway = new GetWebhookGateway({
  webhookRepository,
  logging: logger
});

// Presenter
const presenter = new Presenter();

// Interactor
const getWebhookInteractor = new GetWebhookInteractor({
  gateway: getWebhookGateway,
  presenter
});

// Controller
const getWebhookController = new GetWebhookController({
  interactor: getWebhookInteractor
});

export { getWebhookController };
