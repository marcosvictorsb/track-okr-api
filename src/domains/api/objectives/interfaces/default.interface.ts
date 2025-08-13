import { ModelStatic } from 'sequelize';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';

export interface CreateObjectiveCriteria {
  title: string;
  description?: string;
  id_team: number;
  id_company: number;
  status?: string; //'active' | 'cancelled' | 'completed';
  quarter: number;
  year: number;
  id_planner?: number;
}

export interface FindObjectiveCriteria {
  id?: number;
  title?: string;
  id_team?: number;
  id_company?: number;
  status?: string; //'active' | 'cancelled' | 'completed';
  quarter?: number;
  year?: number;
}

export interface UpdateObjectiveCriteria {
  title?: string;
  description?: string;
  status?: string; //'active' | 'cancelled' | 'completed';
  quarter?: number;
  year?: number;
  updated_at?: Date;
}

export interface DeleteObjectiveCriteria {
  id: number;
}

export interface ObjectiveRepositoryDependencies {
  model: ModelStatic<ObjectiveModel>;
}

export interface IObjectiveRepository {
  create(criteria: CreateObjectiveCriteria): Promise<ObjectiveEntity>;
  findOne(criteria: FindObjectiveCriteria): Promise<ObjectiveEntity | null>;
  findMany(criteria: FindObjectiveCriteria): Promise<ObjectiveEntity[]>;
  update(
    criteria: FindObjectiveCriteria,
    data: UpdateObjectiveCriteria
  ): Promise<ObjectiveEntity | null>;
  delete(criteria: DeleteObjectiveCriteria): Promise<boolean>;
  countObjectivesByQuarter(criteria: FindObjectiveCriteria): Promise<number>;
}
