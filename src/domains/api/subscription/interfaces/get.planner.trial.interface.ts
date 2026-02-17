import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { PlanEntity } from '@domains/api/backoffice/entities/plan.entity';
import {
  FindPlansCriteria,
  IPlanRepository
} from '@domains/api/backoffice/interfaces/default.interfaces';
import { UserCompanyValidationInteractor } from '@domains/common';
import { SubscriptionEntity } from '@domains/common/subscriptions/entity/subscription.entity';
import { ISubscriptionRepository } from '@domains/common/subscriptions/interfaces';
import { IPresenter } from '@protocols/presenter';

export type InputGetPlannerTrial = {
  id_company: number;
  id_user: number;
};

export interface IGetPlannerTrialGateway {
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
  findSubscriptionByCompanyId(
    companyId: number
  ): Promise<SubscriptionEntity | undefined>;
  findPlan(criteria: FindPlansCriteria): Promise<PlanEntity | undefined>;
}

export type IGetPlannerTrialGatewayDependencies = {
  subscriptionRepository: ISubscriptionRepository;
  planRepository: IPlanRepository;
  logging: typeof logger;
};

export type GetPlannerTrialInteractorDependencies = {
  gateway: IGetPlannerTrialGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};
