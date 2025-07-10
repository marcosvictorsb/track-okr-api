import { ModelStatic } from 'sequelize';
import { ResultKeyEntity } from '@domains/api/results-keys/entity/result-key.entity';
import ResultKeyModel from '@domains/api/results-keys/model/result-key.model';

export const ResultKeyStatus = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled'
};

export interface CreateResultKeyCriteria {
  name: string;
  initial_value: number;
  target_value: number;
  current_value?: number;
  unit: string;
  responsible_users?: number[] | null;
  responsible_team_id?: number | null;
  id_okr?: number | null;
  status?: string; //'active' | 'completed' | 'cancelled';
}

export interface FindResultKeyCriteria {
  id?: number;
  name?: string;
  responsible_team_id?: number;
  id_okr?: number;
  ids_okr?: number[]; // Para buscar por múltiplos objetivos
  status?: 'active' | 'completed' | 'cancelled';
  responsible_users?: number[];
  progress_min?: number;
  progress_max?: number;
}

export interface UpdateResultKeyCriteria {
  name?: string;
  initial_value?: number;
  target_value?: number;
  current_value?: number;
  unit?: string;
  responsible_users?: number[] | null;
  responsible_team_id?: number | null;
  okr_id?: number | null;
  status?: 'active' | 'completed' | 'cancelled';
  updated_at?: Date;
}

export interface DeleteResultKeyCriteria {
  id: number;
}

export interface ResultKeyRepositoryDependencies {
  model: ModelStatic<ResultKeyModel>;
}

export interface IResultKeyRepository {
  create(criteria: CreateResultKeyCriteria): Promise<ResultKeyEntity>;
  findOne(criteria: FindResultKeyCriteria): Promise<ResultKeyEntity | null>;
  findMany(criteria: FindResultKeyCriteria): Promise<ResultKeyEntity[]>;
  update(
    criteria: FindResultKeyCriteria,
    data: UpdateResultKeyCriteria
  ): Promise<ResultKeyEntity | null>;
  delete(criteria: DeleteResultKeyCriteria): Promise<boolean>;
  findByObjectiveId(objectiveId: number): Promise<ResultKeyEntity[]>;
  findByObjectiveIds(objectiveIds: number[]): Promise<ResultKeyEntity[]>;
  findByTeamId(teamId: number): Promise<ResultKeyEntity[]>;
  findByResponsibleUser(userId: number): Promise<ResultKeyEntity[]>;
  updateProgress(
    id: number,
    currentValue: number
  ): Promise<ResultKeyEntity | null>;
}
