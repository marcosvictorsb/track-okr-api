import { FindPlansCriteria, IPlanRepository } from './default.interfaces';
import { PlanEntity } from '../entities/plan.entity';
import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { IPresenter } from '@protocols/presenter';
import { DeletePlanInteractor } from '../usecases';
import { ISubscriptionRepository } from '@domains/common/subscriptions/interfaces';

export interface IDeletePlanGateway {
  findPlan(criteria: FindPlansCriteria): Promise<PlanEntity | undefined>;
  hasActiveSubscriptions(planId: number): Promise<boolean>;
  deletePlan(id: number): Promise<boolean>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IDeletePlanGatewayDependencies {
  planRepository: IPlanRepository;
  subscriptionRepository: ISubscriptionRepository;
  logging: typeof logger;
}

export type DeletePlanInteractorDependencies = {
  gateway: IDeletePlanGateway;
  presenter: IPresenter;
};

export type DeletePlanControllerDependencies = {
  interactor: DeletePlanInteractor;
};

export type InputDeletePlan = {
  id: number;
};
