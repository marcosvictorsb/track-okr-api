import { DataLogOutput } from '@adapters/services';
import { CheckinsEntity } from '../entity/checkins.entity';

export interface CreateCheckinsCriteria {
  id_result_key: number;
  previous_value?: number | null;
  new_value: number;
  comment?: string | null;
  id_user: number;
}

export interface FindCheckinsCriteria {
  id?: number;
  id_result_key?: number;
  ids_result_key?: number[];
  id_user?: number;
  created_at?: Date;
  new_value?: number;
  previous_value?: number;
  limit?: number;
  startPeriod?: Date;
  endPeriod?: Date;
}

export interface UpdateCheckinsCriteria {
  comment?: string;
  updated_at?: Date;
}

export interface DeleteCheckinsCriteria {
  ids_result_key?: number[];
}

export interface ICheckinsRepository {
  create(criteria: CreateCheckinsCriteria): Promise<CheckinsEntity>;
  findOne(criteria: FindCheckinsCriteria): Promise<CheckinsEntity | null>;
  findMany(criteria: FindCheckinsCriteria): Promise<CheckinsEntity[]>;
  findByResultKeyId(id_result_key: number): Promise<CheckinsEntity[]>;
  update(
    criteria: FindCheckinsCriteria,
    data: UpdateCheckinsCriteria
  ): Promise<CheckinsEntity | null>;
  delete(criteria: FindCheckinsCriteria): Promise<boolean>;
}

export interface ICheckinsGateway {
  createUpdate(data: CreateCheckinsCriteria): Promise<CheckinsEntity>;
  findUpdatesByResultKey(id_result_key: number): Promise<CheckinsEntity[]>;
  findUpdatesByUser(id_user: number): Promise<CheckinsEntity[]>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}
