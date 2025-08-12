import { SubscriptionEntity } from '@domains/common/subscriptions/entity/subscription.entity';

import {
  CreateSubscriptionCriteria,
  FindSubscriptionsCriteria,
  UpdateSubscriptionCriteria,
  ISubscriptionRepository,
  SubscriptionRepositoryDependencies
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
      auto_renew: data.auto_renew !== undefined ? data.auto_renew : true
    };

    const subscription = await this.model.create(subscriptionData);
    return new SubscriptionEntity(subscription.dataValues);
  }

  public async find(
    criteria: FindSubscriptionsCriteria
  ): Promise<SubscriptionEntity | undefined> {
    const subscription = await this.model.findOne({
      where: this.getConditions(criteria),
      raw: true
    });

    if (!subscription) return undefined;
    return new SubscriptionEntity(subscription.dataValues);
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
      (subscription) => new SubscriptionEntity(subscription.dataValues)
    );
  }

  public async update(
    data: Partial<UpdateSubscriptionCriteria>,
    criteria: UpdateSubscriptionCriteria
  ): Promise<boolean> {
    // Transform data to match Sequelize model expectations
    const updateData: any = {
      ...data,
      updated_at: new Date()
    };

    // Type assertion for status field
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

  // Métodos específicos do domínio subscription
  // public async findByCompany(
  //   companyId: number
  // ): Promise<SubscriptionEntity | undefined> {
  //   return this.find({ company_id: companyId });
  // }

  // public async findActiveByCompany(
  //   companyId: number
  // ): Promise<SubscriptionEntity | undefined> {
  //   return this.find({
  //     company_id: companyId,
  //     status: 'active'
  //   });
  // }

  // public async findTrialByCompany(
  //   companyId: number
  // ): Promise<SubscriptionEntity | undefined> {
  //   return this.find({
  //     company_id: companyId,
  //     status: 'trial'
  //   });
  // }

  // public async findExpiring(days: number = 7): Promise<SubscriptionEntity[]> {
  //   const futureDate = new Date();
  //   futureDate.setDate(futureDate.getDate() + days);

  //   const subscriptions = await this.model.findAll({
  //     where: {
  //       status: ['active', 'trial'],
  //       expires_at: {
  //         [this.model.sequelize?.Op.lte || '$lte']: futureDate
  //       }
  //     },
  //     order: [['expires_at', 'ASC']],
  //     raw: true
  //   });

  //   return subscriptions.map(
  //     (subscription) =>
  //       new SubscriptionEntity(this.transformToEntityData(subscription))
  //   );
  // }

  // public async findExpired(): Promise<SubscriptionEntity[]> {
  //   const now = new Date();

  //   const subscriptions = await this.model.findAll({
  //     where: {
  //       status: ['active', 'trial'],
  //       expires_at: {
  //         [this.model.sequelize?.Op.lt || '$lt']: now
  //       }
  //     },
  //     order: [['expires_at', 'ASC']],
  //     raw: true
  //   });

  //   return subscriptions.map(
  //     (subscription) =>
  //       new SubscriptionEntity(this.transformToEntityData(subscription))
  //   );
  // }

  // public async cancel(
  //   id: number,
  //   reason?: string
  // ): Promise<SubscriptionEntity> {
  //   return this.update({
  //     id,
  //     status: 'canceled',
  //     canceled_at: new Date(),
  //     cancellation_reason: reason
  //   });
  // }

  // public async suspend(
  //   id: number,
  //   gracePeriodDays: number = 7
  // ): Promise<SubscriptionEntity> {
  //   const gracePeriodEnd = new Date();
  //   gracePeriodEnd.setDate(gracePeriodEnd.getDate() + gracePeriodDays);

  //   return this.update({
  //     id,
  //     status: 'suspended',
  //     suspended_at: new Date(),
  //     grace_period_ends_at: gracePeriodEnd
  //   });
  // }

  // public async reactivate(id: number): Promise<SubscriptionEntity> {
  //   // Calcular nova data de expiração baseada no plano
  //   const subscription = await this.find({ id });
  //   if (!subscription) {
  //     throw new Error(`Subscription with id ${id} not found`);
  //   }

  //   // Aqui você poderia adicionar lógica para calcular nova expires_at
  //   // baseado no plano (mensal/anual)
  //   const newExpiresAt = new Date();
  //   newExpiresAt.setMonth(newExpiresAt.getMonth() + 1); // Exemplo: +1 mês

  //   return this.update({
  //     id,
  //     status: 'active',
  //     canceled_at: null,
  //     suspended_at: null,
  //     grace_period_ends_at: null,
  //     expires_at: newExpiresAt,
  //     cancellation_reason: null
  //   });
  // }
}
