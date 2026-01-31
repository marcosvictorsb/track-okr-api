/* eslint-disable @typescript-eslint/no-explicit-any */
import { SubscriptionEntity } from '@domains/common/subscriptions/entity/subscription.entity';

import {
  CreateSubscriptionCriteria,
  FindSubscriptionsCriteria,
  ISubscriptionRepository,
  SubscriptionRepositoryDependencies,
  UpdateSubscriptionCriteria
} from '@domains/common/subscriptions/interfaces';
import { ModelStatic } from 'sequelize';
import SubscriptionModel from '../model/subscription.model';

export class SubscriptionRepository implements ISubscriptionRepository {
  protected model: ModelStatic<SubscriptionModel>;

  constructor(params: SubscriptionRepositoryDependencies) {
    this.model = params.model;
  }

  private getConditions(
    criteria: FindSubscriptionsCriteria
  ): Record<string, any> {
    const whereConditions: Record<string, any> = {};

    if (criteria.id) {
      whereConditions['id'] = criteria.id;
    }

    if (criteria.company_id) {
      whereConditions['company_id'] = criteria.company_id;
    }

    if (criteria.plan_id) {
      whereConditions['plan_id'] = criteria.plan_id;
    }

    if (criteria.status) {
      whereConditions['status'] = criteria.status;
    }

    if (criteria.created_by) {
      whereConditions['created_by'] = criteria.created_by;
    }

    return whereConditions;
  }

  async create(data: CreateSubscriptionCriteria): Promise<SubscriptionEntity> {
    const subscriptionData = {
      ...data,
      status: data.status || 'trial',
      started_at: data.started_at || new Date(),
      auto_renew: data.auto_renew !== undefined ? data.auto_renew : true,
      expires_at: data.expires_at === null ? undefined : data.expires_at
    };

    const subscription = await this.model.create(subscriptionData);
    return new SubscriptionEntity(subscription);
  }

  public async find(
    criteria: FindSubscriptionsCriteria
  ): Promise<SubscriptionEntity | undefined> {
    const subscription = await this.model.findOne({
      where: this.getConditions(criteria),
      raw: true
    });

    if (!subscription) return undefined;
    return new SubscriptionEntity(subscription);
  }

  public async findAll(
    criteria: FindSubscriptionsCriteria = {}
  ): Promise<SubscriptionEntity[]> {
    const subscriptions = await this.model.findAll({
      where: this.getConditions(criteria),
      order: [['created_at', 'DESC']],
      raw: true
    });

    return subscriptions.map(
      (subscription) => new SubscriptionEntity(subscription)
    );
  }

  public async update(
    data: Partial<UpdateSubscriptionCriteria>,
    criteria: UpdateSubscriptionCriteria
  ): Promise<boolean> {
    const updateData: any = {
      ...data,
      updated_at: new Date()
    };

    if (data.status) {
      updateData.status = data.status;
    }

    const [affectedRows] = await this.model.update(updateData, {
      where: { id: criteria.id }
    });

    if (affectedRows === 0) return false;
    return true;
  }

  public async delete(id: number): Promise<boolean> {
    const affectedRows = await this.model.destroy({
      where: { id }
    });

    return affectedRows > 0;
  }

  public async countActiveByPlanId(planId: number): Promise<number> {
    const count = await this.model.count({
      where: {
        plan_id: planId
      }
    });
    return count;
  }
}
