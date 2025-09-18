import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { PlanEntity } from '@domains/api/backoffice/entities/plan.entity';
import {
  FindPlansCriteria,
  IPlanRepository
} from '@domains/api/backoffice/interfaces/default.interfaces';
import { SubscriptionEntity } from '../entity/subscription.entity';
import { CreateTrialSubscriptionInteractor } from '../usecases/create.trial.subscription.interactor';
import {
  CreateSubscriptionCriteria,
  ISubscriptionRepository
} from './default.interfaces';

export type CreateTrialSubscriptionControllerDependencies = {
  interactor: CreateTrialSubscriptionInteractor;
};

export type ICreateTrialSubscriptionGatewayDependencies = {
  planRepository: IPlanRepository;
  subscriptionRepository: ISubscriptionRepository;
  logging: typeof logger;
};

export interface ICreateTrialSubscriptionGateway {
  findPlanTrial(criteria: FindPlansCriteria): Promise<PlanEntity | undefined>;
  createTrialSubscription(
    data: CreateSubscriptionCriteria
  ): Promise<SubscriptionEntity>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export type CreateTrialSubscriptionInteractorDependencies = {
  gateway: ICreateTrialSubscriptionGateway;
};

export type CreateFreeSubscriptionInput = {
  id_company: number;
  isBeta?: boolean;
  name?: string;
};
