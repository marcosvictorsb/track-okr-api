import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { IPresenter } from '@protocols/presenter';
import { GetSubscriptionInteractor } from '../usecases';
import { SubscriptionEntity } from '@domains/common/subscriptions/entity/subscription.entity';
import { SubscriptionHistoryEntity } from '@domains/common/subscriptions/entity/subscription.history.entity';
import {
  FindSubscriptionsCriteria,
  ISubscriptionRepository
} from '@domains/common/subscriptions/interfaces/default.interfaces';
import { ISubscriptionHistoryRepository } from '@domains/common/subscriptions/interfaces/subscription.history.interfaces';
import { PlanEntity } from '../entities/plan.entity';
import { IPlanRepository } from './default.interfaces';

export type SubscriptionWithHistory = SubscriptionEntity & {
  history: SubscriptionHistoryEntity[];
  plan?: PlanEntity;
};

export type InputGetSubscription = {
  page?: number;
  limit?: number;
  status?:
    | 'trial'
    | 'active'
    | 'canceled'
    | 'expired'
    | 'suspended'
    | 'pending_activation';
  company_id?: number;
  plan_id?: number;
  created_by?: number;
  dateFrom?: string;
  dateTo?: string;
  includeHistory?: boolean;
  historyLimit?: number;
};

export interface IGetSubscriptionGateway {
  findSubscriptions(
    criteria: FindSubscriptionsCriteria,
    page?: number,
    limit?: number
  ): Promise<{
    subscriptions: SubscriptionEntity[];
    total: number;
  }>;
  findSubscriptionHistory(
    subscriptionId: number,
    limit?: number
  ): Promise<SubscriptionHistoryEntity[]>;
  findPlan(planId: number): Promise<PlanEntity | undefined>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IGetSubscriptionGatewayDependencies {
  subscriptionRepository: ISubscriptionRepository;
  subscriptionHistoryRepository: ISubscriptionHistoryRepository;
  planRepository: IPlanRepository;
  logging: typeof logger;
}

export type GetSubscriptionInteractorDependencies = {
  gateway: IGetSubscriptionGateway;
  presenter: IPresenter;
};

export type GetSubscriptionControllerDependencies = {
  interactor: GetSubscriptionInteractor;
};
