import { ModelStatic, Op } from 'sequelize';
import { WebhookEntity } from '../entity/webhook.entity';
import {
  CreateWebhookCriteria,
  FindWebhookCriteria,
  IWebhookRepository
} from '../interfaces/default.interfaces';
import WebhookModel from '../model/webhook.model';

export type WebhookRepositoryDependencies = {
  model: ModelStatic<WebhookModel>;
};

export class WebhookRepository implements IWebhookRepository {
  protected model: ModelStatic<WebhookModel>;

  constructor(params: WebhookRepositoryDependencies) {
    this.model = params.model;
  }

  private getConditions(
    criteria: FindWebhookCriteria
  ): Record<string, unknown> {
    const conditions: Record<string, unknown> = {};

    if (criteria.id) conditions.id = criteria.id;
    if (criteria.source) conditions.source = criteria.source;
    if (criteria.description)
      conditions.description = { [Op.iLike]: `%${criteria.description}%` };
    if (criteria.status) conditions.status = criteria.status;
    if (criteria.created) conditions.created = criteria.created;

    if (criteria.createdFrom || criteria.createdTo) {
      const dateConditions: Record<symbol, Date> = {};
      if (criteria.createdFrom) dateConditions[Op.gte] = criteria.createdFrom;
      if (criteria.createdTo) dateConditions[Op.lte] = criteria.createdTo;
      conditions.created = dateConditions;
    }

    return conditions;
  }

  async create(data: CreateWebhookCriteria): Promise<WebhookEntity> {
    const webhook = await this.model.create(data);
    return new WebhookEntity(webhook.dataValues);
  }

  async find(
    criteria: FindWebhookCriteria
  ): Promise<WebhookEntity | undefined> {
    const conditions = this.getConditions(criteria);
    const webhook = await this.model.findOne({ where: conditions });
    return webhook ? new WebhookEntity(webhook.dataValues) : undefined;
  }

  async findAll(criteria: FindWebhookCriteria): Promise<WebhookEntity[]> {
    const conditions = this.getConditions(criteria);
    const webhooks = await this.model.findAll({
      where: conditions,
      order: [['created', 'DESC']]
    });
    return webhooks.map((webhook) => new WebhookEntity(webhook.dataValues));
  }

  async findAllWithPagination(
    criteria: FindWebhookCriteria,
    page: number,
    limit: number
  ): Promise<{
    webhooks: WebhookEntity[];
    total: number;
  }> {
    const conditions = this.getConditions(criteria);
    const offset = (page - 1) * limit;

    const { count, rows } = await this.model.findAndCountAll({
      where: conditions,
      order: [['created', 'DESC']],
      limit,
      offset
    });

    const webhooks = rows.map(
      (webhook) => new WebhookEntity(webhook.dataValues)
    );

    return {
      webhooks,
      total: count
    };
  }
}
