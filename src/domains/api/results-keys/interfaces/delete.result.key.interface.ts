import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';
import {
  DeleteResultKeyCriteria,
  IResultKeyRepository
} from './default.interface';
import { logger } from '@configs/logger';
import { ResultKeyEntity } from '../entity/result-key.entity';

export interface InputDeleteResultKey {
  id: number;
  id_company: number;
  id_user: number;
}

export interface IDeleteResultKeyGateway {
  deleteResultKey(data: DeleteResultKeyCriteria): Promise<boolean>;
  findResultKey(
    criteria: DeleteResultKeyCriteria
  ): Promise<ResultKeyEntity | undefined>;
  loggerInfo(message: string, data?: Record<string, unknown>): void;
  loggerError(message: string, data?: Record<string, unknown>): void;
}

export interface DeleteResultKeyInteractorDependencies {
  gateway: IDeleteResultKeyGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
}

export interface DeleteResultKeyControllerDependencies {
  interactor: {
    execute(input: InputDeleteResultKey): Promise<HttpResponse>;
  };
}

export interface IDeleteResultKeyGatewayDependencies {
  resultKeyRepository: IResultKeyRepository;
  logging: typeof logger;
}
