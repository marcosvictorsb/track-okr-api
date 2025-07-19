import { ResultKeyUpdateEntity } from '../entity/result-key-update.entity';
import { ResultKeyEntity } from '../../results-keys/entity/result-key.entity';
import {
  FindResultKeyCriteria,
  IResultKeyRepository
} from '../../results-keys/interfaces/default.interface';
import {
  FindResultKeyUpdateCriteria,
  IResultKeyUpdateRepository
} from './result-key-update.interface';
import { Response } from 'express';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { IPresenter } from '@protocols/presenter';
import { HttpResponse } from '@protocols/http';
import { DataLogOutput } from '@adapters/services';

export interface InputGetKeyResultUpdate {
  id_company: number;
  id_result_key: number;
  id_user: number;
}

export interface GetKeyResultUpdateResponse {
  value: number;
  date: string; // ISO string
  user: string;
  comment: string | null;
}

export interface IGetKeyResultUpdateGatewayDependencies {
  resultKeyRepository: IResultKeyRepository;
  resultKeyUpdateRepository: IResultKeyUpdateRepository;
  logging: typeof import('@configs/logger').logger;
}

export interface IGetKeyResultUpdateGateway {
  findResultKey(
    criteria: FindResultKeyCriteria
  ): Promise<ResultKeyEntity | null>;
  findUpdatesByResultKey(
    criteria: FindResultKeyUpdateCriteria
  ): Promise<ResultKeyUpdateEntity[]>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IGetKeyResultUpdateInteractorDependencies {
  gateway: IGetKeyResultUpdateGateway;
  presenter: IPresenter;
  // userCompanyValidator: UserCompanyValidationInteractor;
}

export interface IGetKeyResultUpdateInteractor {
  execute(params: InputGetKeyResultUpdate): Promise<HttpResponse>;
}

export interface IGetKeyResultUpdateController {
  getKeyResultUpdate(
    request: UserPayload,
    response: Response
  ): Promise<Response>;
}
