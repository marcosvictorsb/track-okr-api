import { ExportRequestEntity } from '@domains/api/exports/entity/export.request.entity';
import ExportRequestModel from '@domains/api/exports/model/export.request.model';
import { ModelStatic } from 'sequelize';

export enum ExportRequestStatus {
  PENDING = 'pending',
  COMPLETED = 'completed',
  ERROR = 'error'
}

export type CreateExportRequestCriteria = {
  id_user: number;
  status: string;
  id_company: number;
  requested_at?: Date;
  completed_at?: Date | null;
  error_message?: string | null;
  email: string;
};

export type CreateExportRequestCriteriaGateway = Omit<
  CreateExportRequestCriteria,
  'email'
>;

export type FindExportRequestCriteria = {
  id?: number;
  id_user?: number;
  id_company?: number;
  status?: string;
  statuses?: string[];
  email?: string;
  created_at?: Date;
  updated_at?: Date;
  deleted_at?: Date;
};

export type UpdateExportRequestCriteria = {
  id?: number;
  status?: string;
  completed_at?: Date | null;
  error_message?: string | null;
};

export type DeleteExportRequestCriteria = {
  id: number;
};

export interface IExportRequestRepository {
  create(criteria: CreateExportRequestCriteria): Promise<ExportRequestEntity>;
  find(
    criteria: FindExportRequestCriteria
  ): Promise<ExportRequestEntity | undefined>;
  findAll(criteria: FindExportRequestCriteria): Promise<ExportRequestEntity[]>;
  update(
    data: Partial<UpdateExportRequestCriteria>,
    criteria: UpdateExportRequestCriteria
  ): Promise<boolean>;
  delete(criteria: DeleteExportRequestCriteria): Promise<boolean>;
  countRequests(criteria: FindExportRequestCriteria): Promise<number>;
}

export type ExportRequestRepositoryDependencies = {
  model: ModelStatic<ExportRequestModel>;
};
