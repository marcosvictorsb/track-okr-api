import {
  IGetWebhookGateway,
  IGetWebhookGatewayDependencies
} from '../interfaces/get.webhook.interfaces';
import {
  FindWebhookCriteria,
  IWebhookRepository
} from '@domains/common/webhooks/interfaces/default.interfaces';
import { WebhookEntity } from '@domains/common/webhooks/entity/webhook.entity';
import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';

export class GetWebhookGateway implements IGetWebhookGateway {
  protected webhookRepository: IWebhookRepository;
  protected logging: typeof logger;

  constructor(params: IGetWebhookGatewayDependencies) {
    this.webhookRepository = params.webhookRepository;
    this.logging = params.logging;
  }

  async findWebhooks(
    criteria: FindWebhookCriteria,
    page?: number,
    limit?: number
  ): Promise<{
    webhooks: WebhookEntity[];
    total: number;
  }> {
    if (page && limit) {
      return await this.webhookRepository.findAllWithPagination(
        criteria,
        page,
        limit
      );
    } else {
      const webhooks = await this.webhookRepository.findAll(criteria);
      return {
        webhooks,
        total: webhooks.length
      };
    }
  }

  loggerInfo(message: string, data?: DataLogOutput): void {
    this.logging.info(message, data);
  }

  loggerError(message: string, data?: DataLogOutput): void {
    this.logging.error(message, data);
  }
}
