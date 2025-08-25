import { IPresenter } from '@protocols/presenter';
import { HttpResponse } from '@protocols/http';
import { UserCompanyValidationInteractor } from '@domains/common';
import { DataLogOutput } from '@adapters/services';
import { CheckinsEntity } from '../entity/checkins.entity';
import { ResultKeyEntity } from '../../results-keys/entity/result-key.entity';
import {
  FindResultKeyCriteria,
  IResultKeyRepository
} from '../../results-keys/interfaces/default.interface';
import { ICheckinsRepository } from './default.interface';

export interface CreateCheckinsRequest {
  id_result_key: number;
  new_value: number;
  comment?: string;
}

export interface CreateCheckinsResponse {
  update: CheckinsEntity;
}

export interface InputCreateCheckins {
  id_result_key: number;
  new_value: number;
  comment?: string;
  id_company: number;
  id_user: number;
}

export interface CreateCheckinsInteractorDependencies {
  gateway: ICreateCheckinsGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
}

export interface CreateCheckinsControllerDependencies {
  interactor: {
    execute(input: InputCreateCheckins): Promise<HttpResponse>;
  };
}

export interface ICreateCheckinsController {
  createUpdate(request: unknown, response: unknown): Promise<unknown>;
}

export interface ICreateCheckinsGateway {
  findResultKey(
    criteria: FindResultKeyCriteria
  ): Promise<ResultKeyEntity | undefined>;
  createUpdate(data: {
    id_result_key: number;
    previous_value?: number | null;
    new_value: number;
    comment?: string | null;
    id_user: number;
  }): Promise<CheckinsEntity>;
  updateResultKeyCurrentValue(id: number, new_value: number): Promise<boolean>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface ICreateCheckinsGatewayDependencies {
  resultKeyRepository: IResultKeyRepository;
  checkinsRepository: ICheckinsRepository;
  logging: typeof import('@configs/logger').logger;
}
