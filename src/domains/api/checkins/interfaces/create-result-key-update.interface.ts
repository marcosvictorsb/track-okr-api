import { IPresenter } from '@protocols/presenter';
import { HttpResponse } from '@protocols/http';
import { UserCompanyValidationInteractor } from '@domains/common';
import { DataLogOutput } from '@adapters/services';
import { ResultKeyUpdateEntity } from '../entity/result-key-update.entity';
import { ResultKeyEntity } from '../../results-keys/entity/result-key.entity';
import {
  FindResultKeyCriteria,
  IResultKeyRepository
} from '../../results-keys/interfaces/default.interface';
import { IResultKeyUpdateRepository } from './result-key-update.interface';

export interface CreateResultKeyUpdateRequest {
  id_result_key: number;
  new_value: number;
  comment?: string;
}

export interface CreateResultKeyUpdateResponse {
  update: ResultKeyUpdateEntity;
}

export interface InputCreateResultKeyUpdate {
  id_result_key: number;
  new_value: number;
  comment?: string;
  id_company: number;
  id_user: number;
}

export interface CreateResultKeyUpdateInteractorDependencies {
  gateway: ICreateResultKeyUpdateGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
}

export interface CreateResultKeyUpdateControllerDependencies {
  interactor: {
    execute(input: InputCreateResultKeyUpdate): Promise<HttpResponse>;
  };
}

export interface ICreateResultKeyUpdateController {
  createUpdate(request: unknown, response: unknown): Promise<unknown>;
}

export interface ICreateResultKeyUpdateGateway {
  findResultKey(
    criteria: FindResultKeyCriteria
  ): Promise<ResultKeyEntity | null>;
  createUpdate(data: {
    id_result_key: number;
    previous_value?: number | null;
    new_value: number;
    comment?: string | null;
    id_user: number;
  }): Promise<ResultKeyUpdateEntity>;
  updateResultKeyCurrentValue(id: number, new_value: number): Promise<boolean>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface ICreateResultKeyUpdateGatewayDependencies {
  resultKeyRepository: IResultKeyRepository;
  resultKeyUpdateRepository: IResultKeyUpdateRepository;
  logging: typeof import('@configs/logger').logger;
}
