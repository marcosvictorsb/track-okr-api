import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { IUserRepository } from '@domains/api/users/interfaces';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { ExportRequestEntity } from '../entity/export.request.entity';
import {
  CreateExportRequestCriteriaGateway,
  IExportRequestRepository
} from './default.interfaces';

export type InputCreateExportRequest = {
  id_user: number;
  id_company: number;
};

export type CreateExportRequestInteractorDependencies = {
  gateway: ICreateExportRequestGateway;
  presenter: IPresenter;
};

export type CreateExportRequestControllerDependencies = {
  interactor: {
    execute(input: InputCreateExportRequest): Promise<HttpResponse>;
  };
};

export interface ICreateExportRequestGateway {
  createExportRequest(
    criteria: CreateExportRequestCriteriaGateway
  ): Promise<ExportRequestEntity>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface ICreateExportRequestGatewayDependencies {
  exportRequestRepository: IExportRequestRepository;
  userRepository: IUserRepository;
  logging: typeof logger;
}
