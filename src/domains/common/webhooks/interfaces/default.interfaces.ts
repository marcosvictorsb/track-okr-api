import { WebhookEntity } from '../entity/webhook.entity';

export const WEBHOOK_STATUS = {
  PENDING: 'pending',
  CHECK: 'check',
  SUCCESS: 'success'
} as const;

export type WebhookStatus =
  (typeof WEBHOOK_STATUS)[keyof typeof WEBHOOK_STATUS];

export type CreateWebhookCriteria = {
  source: string;
  description: string;
  json: string;
  status: WebhookStatus;
  created: Date;
};

export type FindWebhookCriteria = {
  id?: number;
  source?: string;
  description?: string;
  status?: WebhookStatus;
  created?: Date;
  createdFrom?: Date;
  createdTo?: Date;
};

export interface IWebhookRepository {
  create(criteria: CreateWebhookCriteria): Promise<WebhookEntity>;
  find(criteria: FindWebhookCriteria): Promise<WebhookEntity | undefined>;
  findAll(criteria: FindWebhookCriteria): Promise<WebhookEntity[]>;
}
