import { PlannerEntity } from '@domains/api/planners/entity/planner.entity';
import PlannerModel from '@domains/api/planners/model/planner.model';
import { ModelStatic } from 'sequelize';

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
  name?: string;
  title?: string;
  description?: string;
  year?: number;
  id_company?: number;
  id_user?: number;
  limite?: number;
  created_after?: Date;
  created_before?: Date;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
};

export type DeletePlannerCriteria = {
  id: number;
};

export type UpdatePlannerCriteria = {
  id?: number;
  title?: string;
  description?: string;
  year?: number;
  id_company?: number;
};

export interface IPlannerRepository {
  create(criteria: CreatePlannerCriteria): Promise<PlannerEntity>;
  find(criteria: FindPlannerCriteria): Promise<PlannerEntity | undefined>;
  findAll(criteria: FindPlannerCriteria): Promise<PlannerEntity[]>;
  update(
    criteria: UpdatePlannerCriteria,
    data: Partial<PlannerEntity>
  ): Promise<boolean>;
  delete(criteria: DeletePlannerCriteria): Promise<boolean>;
  count(criteria: FindPlannerCriteria): Promise<number>;
}

export type PlannerRepositoryDependencies = {
  model: ModelStatic<PlannerModel>;
};
