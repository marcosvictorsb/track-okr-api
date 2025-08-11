import { ModelStatic } from 'sequelize';
import { PlanModel } from '../models/plan.model';
import { PlanEntity } from '../entities/plan.entity';
import { logger } from '@configs/logger';
import { IPresenter } from '@protocols/presenter';
import {
  CreateUserCriteria,
  FindUserCriteria,
  IUserRepository
} from '@domains/api/users/interfaces';
import { UserEntity } from '@domains/api/users/entity/user.entity';

export type FindPlansCriteria = {
  id?: number;
  name?: string;
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

export type PlannerRepositoryDependencies = {
  model: ModelStatic<PlanModel>;
};

export interface IPlanRepository {
  create(data: CreatePlanCriteria): Promise<PlanEntity>;
  find(criteria: FindPlansCriteria): Promise<PlanEntity | undefined>;
  findAll(): Promise<PlanEntity[]>;
}

export interface ICreatePlanGateway {
  findPlan(criteria: FindPlansCriteria): Promise<PlanEntity | undefined>;
  createPlan(data: CreatePlanCriteria): Promise<PlanEntity>;
  findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined>;
  createUser(data: CreateUserCriteria): Promise<UserEntity | undefined>;
}

export interface ICreatePlanGatewayDependencies {
  planRepository: IPlanRepository;
  userRepository: IUserRepository;
  logging: typeof logger;
}

export type CreatePlanInteractorDependencies = {
  logger: typeof logger;
  presenter: IPresenter;
};
