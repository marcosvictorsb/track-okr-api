import { PlannerEntity } from '@domains/api/planners/entity/planner.entity';
import { ModelStatic } from 'sequelize';
import PlannerModel from '@domains/api/planners/model/planner.model';

export type CreatePlannerCriteria = {
  title: string;
  description: string;
  year: number;
  id_company: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
};

export type FindPlannerCriteria = {
  id?: number;
  title?: string;
  description?: string;
  year?: number;
  id_company?: number;
  id_user?: number;
  limite?: number;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
};

export type DeletePlannerCriteria = {
  id: number;
};

export type UpdatePlannerCriteria = {
  id?: number
  title?: string;
  description?: string;
  year?: number;
  id_company?: number;
};

export interface IPlannerRepository {
  create(criteria: CreatePlannerCriteria): Promise<PlannerEntity>;
  find(
    criteria: FindPlannerCriteria
  ): Promise<PlannerEntity | undefined>;
  // findAll(criteria: FindPlannerCriteria): Promise<PlannerEntity[]>;
  update(
    criteria: UpdatePlannerCriteria,
    data: Partial<PlannerEntity>
  ): Promise<boolean>;
  delete(criteria: DeletePlannerCriteria): Promise<boolean>;
}

export type PlannerRepositoryDependencies = {
  model: ModelStatic<PlannerModel>;
};
