import { ObjectiveEntity } from '../entity/objective.entity';

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
