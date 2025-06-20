import SubscriptionModel from '@domains/api/subscriptions/model/subscription.model';
import { SubscriptionEntity } from '@domains/api/subscriptions/entity/subscription.entity';
import { ModelStatic } from 'sequelize';
import {
  CreateSubscriptionCriteria,
  DeleteSubscriptionCriteria,
  FindSubscriptionCriteria,
  ISubscriptionRepository,
  UpdateSubscriptionCriteria,
  SubscriptionRepositoryDependencies
} from '@domains/api/subscriptions/interfaces';

export class SubscriptionRepository implements ISubscriptionRepository {
  protected model: ModelStatic<SubscriptionModel>;

  constructor(params: SubscriptionRepositoryDependencies) {
    this.model = params.model;
  }

  private getConditions(
    criteria: FindSubscriptionCriteria
  ): Record<string, any> {
    const whereConditions: Record<string, any> = {};

    if (criteria.id) {
      whereConditions['id'] = criteria.id;
    }

    return whereConditions;
  }

  public async create(
    data: CreateSubscriptionCriteria
  ): Promise<SubscriptionEntity> {
    const subscription = await this.model.create(data);
    return new SubscriptionEntity(subscription.dataValues);
  }

  public async find(
    criteria: FindSubscriptionCriteria
  ): Promise<SubscriptionEntity | undefined> {
    const subscription = await this.model.findOne({
      where: this.getConditions(criteria),
      raw: true
    });

    if (!subscription) return undefined;

    return new SubscriptionEntity(subscription.get({ plain: true }));
  }

  public async update(
    data: UpdateSubscriptionCriteria,
    criteria: Partial<SubscriptionEntity>
  ): Promise<boolean> {
    const [affectedRows] = await this.model.update(data, {
      where: { id: criteria.id }
    });
    if (affectedRows === 0) return false;
    return true;
  }

  public async delete(criteria: DeleteSubscriptionCriteria): Promise<boolean> {
    const affectedRows = await this.model.destroy({
      where: { id: criteria.id }
    });
    return affectedRows > 0;
  }
}
