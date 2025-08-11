import { Presenter } from '@protocols/presenter';
import { ListPlanInteractor } from '../usecases/list.plan.interactor';
import { ListPlanGateway } from '../gateway/list.plan.gateway';
import { PlanRepository } from '../repository/plan.repository';
import { logger } from '@configs/logger';
import { PlanEntity } from '../entities/plan.entity';

export interface ListPlansInput {
  active?: boolean;
  limit?: number;
  offset?: number;
}

export interface ListPlansOutput {
  plans: Array<{
    id: number;
    name: string;
    description: string;
    max_users: number;
    max_planners: number;
    max_teams: number;
    max_objectives_per_quarter: number;
    max_key_results_per_objective: number;
    created_at: Date;
    updated_at?: Date;
    deleted_at?: Date;
  }>;
  total: number;
  limit?: number;
  offset?: number;
}

export type ListPlanControllerDependencies = {
  interactor: ListPlanInteractor;
};

export type ListPlanGatewayDependencies = {
  planRepository: PlanRepository;
  logging: typeof logger;
};

export type ListPlanInteractorDepedencies = {
  gateway: ListPlanGateway;
  presenter: Presenter;
};

export interface IListPlanGateway {
  findAllPlans(input?: ListPlansInput): Promise<PlanEntity[]>;
}
