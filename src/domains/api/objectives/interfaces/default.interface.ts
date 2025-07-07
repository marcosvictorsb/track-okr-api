import { ModelStatic } from 'sequelize';
import { ObjectiveEntity } from '@domains/api/objectives/entity/objective.entity';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';
import { DataLogOutput } from '@adapters/services';
import { FindTeamCriteria } from '@domains/api/teams/interfaces';
import { TeamEntity } from '@domains/api/teams/entity/team.entity';

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
  update(
    criteria: FindObjectiveCriteria,
    data: UpdateObjectiveCriteria
  ): Promise<ObjectiveEntity | null>;
  delete(criteria: DeleteObjectiveCriteria): Promise<boolean>;
}

// Gateway Interfaces
export interface IObjectiveGateway {
  create(data: CreateObjectiveCriteria): Promise<ObjectiveEntity>;
  findById(id: number): Promise<ObjectiveEntity | null>;
  findByTeam(id_team: number): Promise<ObjectiveEntity[]>;
  findByQuarter(quarter: number, year: number): Promise<ObjectiveEntity[]>;
  update(
    id: number,
    data: UpdateObjectiveCriteria
  ): Promise<ObjectiveEntity | null>;
  findTeam(criteria: FindTeamCriteria): Promise<TeamEntity[]>;
  delete(id: number): Promise<boolean>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}
