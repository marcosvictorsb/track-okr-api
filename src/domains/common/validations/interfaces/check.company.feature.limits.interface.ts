import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { PlanEntity } from '@domains/api/backoffice/entities/plan.entity';
import { IPlanRepository } from '@domains/api/backoffice/interfaces/default.interfaces';
import { IObjectiveRepository } from '@domains/api/objectives/interfaces';
import {
  FindPlannerCriteria,
  IPlannerRepository
} from '@domains/api/planners/interfaces';
import { SubscriptionEntity } from '@domains/common/subscriptions/entity/subscription.entity';
import {
  FindSubscriptionsCriteria,
  ISubscriptionRepository
} from '@domains/common/subscriptions/interfaces';

// Tipos possíveis de feature para validação de limite
export enum FeatureType {
  MAX_USER = 'max_users',
  MAX_PLANNERS = 'max_planners',
  MAX_TEAMS = 'max_teams',
  MAX_OBJECTIVES_PER_QUARTER = 'max_objectives_per_quarter',
  max_key_results_per_objective = 'max_key_results_per_objective'
}
// Input esperado pelo interactor
export interface CheckCompanyFeatureLimitsInput {
  id_company: number;
  feature: FeatureType;
  year?: number;
  quarter?: number;
}

export type InputGetCurrentUsage = {
  id_company: number;
  feature: FeatureType;
  year?: number;
  quarter?: number;
};

export interface ICheckCompanyFeatureLimitsGateway {
  findActiveSubscriptionByCompany(
    criteria: FindSubscriptionsCriteria
  ): Promise<SubscriptionEntity | undefined>;
  findPlan(criteria: FindPlannerCriteria): Promise<PlanEntity | undefined>;
  getCurrentUsage(criteria: InputGetCurrentUsage): Promise<number>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export type CheckCompanyFeatureLimitsInteractorDependencies = {
  gateway: ICheckCompanyFeatureLimitsGateway;
};

export type CheckCompanyFeatureLimitsGatewayDependencies = {
  subscriptionRepository: ISubscriptionRepository;
  planRepository: IPlanRepository;
  plannerRepository: IPlannerRepository;
  objectiveRepository: IObjectiveRepository;
  logging: typeof logger;
};

export interface ICheckCompanyFeatureLimitsInteractor {
  execute(input: CheckCompanyFeatureLimitsInput): Promise<{
    limit: number;
    currentUsage: number;
    isWithinLimit: boolean;
  }>;
}
