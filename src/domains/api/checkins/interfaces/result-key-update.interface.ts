import { ResultKeyUpdateEntity } from '../entity/result-key-update.entity';
import { DataLogOutput } from '@adapters/services';

export interface CreateResultKeyUpdateCriteria {
  id_result_key: number;
  previous_value?: number | null;
  new_value: number;
  comment?: string | null;
  id_user: number;
}

export interface FindResultKeyUpdateCriteria {
  id?: number;
  id_result_key?: number;
  ids_result_key?: number[];
  id_user?: number;
  created_at?: Date;
  new_value?: number;
  previous_value?: number;
}

export interface UpdateResultKeyUpdateCriteria {
  comment?: string;
  updated_at?: Date;
}

export interface IResultKeyUpdateRepository {
  create(
    criteria: CreateResultKeyUpdateCriteria
  ): Promise<ResultKeyUpdateEntity>;
  findOne(
    criteria: FindResultKeyUpdateCriteria
  ): Promise<ResultKeyUpdateEntity | null>;
  findMany(
    criteria: FindResultKeyUpdateCriteria
  ): Promise<ResultKeyUpdateEntity[]>;
  findByResultKeyId(id_result_key: number): Promise<ResultKeyUpdateEntity[]>;
  update(
    criteria: FindResultKeyUpdateCriteria,
    data: UpdateResultKeyUpdateCriteria
  ): Promise<ResultKeyUpdateEntity | null>;
  delete(criteria: FindResultKeyUpdateCriteria): Promise<boolean>;
}

export interface IResultKeyUpdateGateway {
  createUpdate(
    data: CreateResultKeyUpdateCriteria
  ): Promise<ResultKeyUpdateEntity>;
  findUpdatesByResultKey(
    id_result_key: number
  ): Promise<ResultKeyUpdateEntity[]>;
  findUpdatesByUser(id_user: number): Promise<ResultKeyUpdateEntity[]>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}
