import {
  CreatePlanCriteria,
  FindPlansCriteria,
  IPlanRepository
} from './default.interfaces';
import { PlanEntity } from '../entities/plan.entity';
import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { IPresenter } from '@protocols/presenter';
import { CreatePlanInteractor } from '../usecases';

export type CreatePlanRequest = {
  name: string;
  description?: string;
  max_users: number;
  max_planners: number;
  max_teams: number;
  max_objectives_per_quarter: number;
  max_key_results_per_objective: number;
};

export interface ICreatePlanGateway {
  findPlan(criteria: FindPlansCriteria): Promise<PlanEntity | undefined>;
  createPlan(data: CreatePlanCriteria): Promise<PlanEntity>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface ICreatePlanGatewayDependencies {
  planRepository: IPlanRepository;
  logging: typeof logger;
}

export type CreatePlanInteractorDependencies = {
  gateway: ICreatePlanGateway;
  presenter: IPresenter;
};

export type CreatePlanControllerDependencies = {
  interactor: CreatePlanInteractor;
};

export type InputCreatePlan = {
  name: string;
  description?: string;
  max_users: number;
  max_planners: number;
  max_teams: number;
  max_objectives_per_quarter: number;
  secret: string;
  max_key_results_per_objective: number;
};
