import { SubscriptionEntity } from '@domains/api/subscriptions/entity/subscription.entity';
import { ModelStatic } from 'sequelize';
import SubscriptionModel from '@domains/api/subscriptions/model/subscription.model';

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled'
};

export type CreateSubscriptionCriteria = {
  id_company: number;
  amount_users: number;
  status: SubscriptionStatus
  id_external_payment: string;
};

export type FindSubscriptionCriteria = {
  id?: number;
  id_company?: number;
  amount_users?: number;
  status?: SubscriptionStatus
  id_external_payment?: string;
};

export type DeleteSubscriptionCriteria = {
  id: number;
};

export type UpdateSubscriptionCriteria = {
  id?: number;
  id_company?: number;
  amount_users?: number;
  status?: SubscriptionStatus
  id_external_payment?: string;
};

export interface ISubscriptionRepository {
  create(criteria: CreateSubscriptionCriteria): Promise<SubscriptionEntity>;
  find(
    criteria: FindSubscriptionCriteria
  ): Promise<SubscriptionEntity | undefined>;
  // findAll(criteria: FindSubscriptionCriteria): Promise<SubscriptionEntity[]>;
  update(
    criteria: UpdateSubscriptionCriteria,
    data: Partial<SubscriptionEntity>
  ): Promise<boolean>;
  delete(criteria: DeleteSubscriptionCriteria): Promise<boolean>;
}

export type SubscriptionRepositoryDependencies = {
  model: ModelStatic<SubscriptionModel>;
};
