import { SubscriptionEntity } from '@domains/common/subscriptions/entity/subscription.entity';
import { ModelStatic } from 'sequelize';
import SubscriptionModel from '../model/subscription.model';

export enum SubscriptionStatus {
  TRIAL = 'trial',
  ACTIVE = 'active',
  CANCELED = 'canceled',
  EXPIRED = 'expired',
  SUSPENDED = 'suspended',
  PENDING_ACTIVATION = 'pending_activation'
}

export type SubscriptionStatusType = `${SubscriptionStatus}`;

export const SUBSCRIPTION_STATUS_VALUES = Object.values(
  SubscriptionStatus
) as SubscriptionStatusType[];

export function isValidSubscriptionStatus(
  status: string
): status is SubscriptionStatusType {
  return SUBSCRIPTION_STATUS_VALUES.includes(status as SubscriptionStatusType);
}

export const SUBSCRIPTION_STATUS_DESCRIPTIONS: Record<
  SubscriptionStatus,
  string
> = {
  [SubscriptionStatus.TRIAL]: 'Período de teste',
  [SubscriptionStatus.ACTIVE]: 'Ativa',
  [SubscriptionStatus.CANCELED]: 'Cancelada',
  [SubscriptionStatus.EXPIRED]: 'Expirada',
  [SubscriptionStatus.SUSPENDED]: 'Suspensa',
  [SubscriptionStatus.PENDING_ACTIVATION]: 'Aguardando ativação'
};

export interface CreateSubscriptionCriteria {
  company_id: number;
  plan_id: number;
  status: SubscriptionStatus;
  trial_start_date?: Date;
  trial_end_date?: Date;
  started_at?: Date;
  expires_at?: Date | null;
  auto_renew?: boolean;
  created_by?: number;
  notes?: string;
}

export interface FindSubscriptionsCriteria {
  id?: number;
  company_id?: number;
  plan_id?: number;
  status?: SubscriptionStatusType;
  created_by?: number;
}

export interface UpdateSubscriptionCriteria {
  id: number;
  plan_id?: number;
  status?: SubscriptionStatusType;
  trial_start_date?: Date;
  trial_end_date?: Date;
  expires_at?: Date;
  canceled_at?: Date;
  suspended_at?: Date;
  grace_period_ends_at?: Date;
  auto_renew?: boolean;
  cancellation_reason?: string;
  notes?: string;
}

export type SubscriptionRepositoryDependencies = {
  model: ModelStatic<SubscriptionModel>;
};

export interface ISubscriptionRepository {
  create(data: CreateSubscriptionCriteria): Promise<SubscriptionEntity>;
  find(
    criteria: FindSubscriptionsCriteria
  ): Promise<SubscriptionEntity | undefined>;
  findAll(criteria?: FindSubscriptionsCriteria): Promise<SubscriptionEntity[]>;
  update(
    data: Partial<UpdateSubscriptionCriteria>,
    criteria: UpdateSubscriptionCriteria
  ): Promise<boolean>;
  delete(id: number): Promise<boolean>;
  countActiveByPlanId(planId: number): Promise<number>;
}
