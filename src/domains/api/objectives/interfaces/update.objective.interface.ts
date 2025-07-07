import { DataLogOutput } from '@adapters/services';
import { ObjectiveEntity } from '../entity/objective.entity';
import { UpdateObjectiveCriteria } from './default.interface';

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

export interface IUpdateObjectiveController {
  updateObjective(request: unknown, response: unknown): Promise<void>;
}

export interface IUpdateObjectiveGateway {
  findById(id: number): Promise<ObjectiveEntity | null>;
  update(
    id: number,
    data: UpdateObjectiveCriteria
  ): Promise<ObjectiveEntity | null>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}
