import { ModelStatic } from 'sequelize';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';

// Repository Interfaces
export interface CreateObjectiveCriteria {
  title: string;
  description?: string;
  id_team: number;
  status?: 'active' | 'cancelled' | 'completed';
  quarter: number;
  year: number;
}

export interface FindObjectiveCriteria {
  id?: number;
  title?: string;
  id_team?: number;
  status?: 'active' | 'cancelled' | 'completed';
  quarter?: number;
  year?: number;
}

export interface UpdateObjectiveCriteria {
  title?: string;
  description?: string;
  status?: 'active' | 'cancelled' | 'completed';
  quarter?: number;
  year?: number;
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
  update(criteria: FindObjectiveCriteria, data: UpdateObjectiveCriteria): Promise<ObjectiveEntity | null>;
  delete(criteria: DeleteObjectiveCriteria): Promise<boolean>;
}

// Gateway Interfaces
export interface IObjectiveGateway {
  create(data: CreateObjectiveCriteria): Promise<ObjectiveEntity>;
  findById(id: number): Promise<ObjectiveEntity | null>;
  findByTeam(id_team: number): Promise<ObjectiveEntity[]>;
  findByQuarter(quarter: number, year: number): Promise<ObjectiveEntity[]>;
  update(id: number, data: UpdateObjectiveCriteria): Promise<ObjectiveEntity | null>;
  delete(id: number): Promise<boolean>;
}

// UseCase Interfaces
export interface CreateObjectiveRequest {
  title: string;
  description?: string;
  id_team: number;
  quarter: number;
  year: number;
}

export interface CreateObjectiveResponse {
  objective: ObjectiveEntity;
}

export interface GetObjectiveRequest {
  id?: number;
  id_team?: number;
  quarter?: number;
  year?: number;
}

export interface GetObjectiveResponse {
  objectives: ObjectiveEntity[];
}

export interface UpdateObjectiveRequest {
  id: number;
  title?: string;
  description?: string;
  status?: 'active' | 'cancelled' | 'completed';
  quarter?: number;
  year?: number;
}

export interface UpdateObjectiveResponse {
  objective: ObjectiveEntity;
}

export interface DeleteObjectiveRequest {
  id: number;
}

export interface DeleteObjectiveResponse {
  success: boolean;
}

// Controller Interfaces
export interface ICreateObjectiveController {
  createObjective(request: unknown, response: unknown): Promise<void>;
}

export interface IGetObjectiveController {
  getObjectives(request: unknown, response: unknown): Promise<void>;
}

export interface IUpdateObjectiveController {
  updateObjective(request: unknown, response: unknown): Promise<void>;
}

export interface IDeleteObjectiveController {
  deleteObjective(request: unknown, response: unknown): Promise<void>;
}
