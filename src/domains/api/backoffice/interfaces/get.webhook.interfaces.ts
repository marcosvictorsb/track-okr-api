import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { IPresenter } from '@protocols/presenter';
import { GetWebhookInteractor } from '../usecases';
import { WebhookEntity } from '@domains/common/webhooks/entity/webhook.entity';
import {
  FindWebhookCriteria,
  IWebhookRepository
} from '@domains/common/webhooks/interfaces/default.interfaces';

export type InputGetWebhook = {
  page?: number;
  limit?: number;
  source?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
};

export interface IGetWebhookGateway {
  findWebhooks(
    criteria: FindWebhookCriteria,
    page?: number,
    limit?: number
  ): Promise<{
    webhooks: WebhookEntity[];
    total: number;
  }>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IGetWebhookGatewayDependencies {
  webhookRepository: IWebhookRepository;
  logging: typeof logger;
}

export type GetWebhookInteractorDependencies = {
  gateway: IGetWebhookGateway;
  presenter: IPresenter;
};

export type GetWebhookControllerDependencies = {
  interactor: GetWebhookInteractor;
};
