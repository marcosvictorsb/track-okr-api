import { ModelStatic } from 'sequelize';
import { PlanModel } from '../models/plan.model';
import { PlanEntity } from '../entities/plan.entity';

export type FindPlansCriteria = {
  id?: number;
  name?: string;
  isTrial?: boolean;
};

export type CreatePlanCriteria = {
  name: string;
  description: string;
  max_users: number;
  max_planners: number;
  max_teams: number;
  max_objectives_per_quarter: number;
  max_key_results_per_objective: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
};

export type PlanRepositoryDependencies = {
  model: ModelStatic<PlanModel>;
};

export interface IPlanRepository {
  create(data: CreatePlanCriteria): Promise<PlanEntity>;
  find(criteria: FindPlansCriteria): Promise<PlanEntity | undefined>;
  findAll(): Promise<PlanEntity[]>;
}
