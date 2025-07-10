import { ResultKeyUpdateEntity } from '../entity/result-key-update.entity';
import { ResultKeyEntity } from '../entity/result-key.entity';
import {
  FindResultKeyCriteria,
  IResultKeyRepository
} from './default.interface';
import {
  FindResultKeyUpdateCriteria,
  IResultKeyUpdateRepository
} from './result-key-update.interface';
import { Response } from 'express';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { IPresenter } from '@protocols/presenter';
import { HttpResponse } from '@protocols/http';

export interface InputGetKeyResultsUpdatesHistory {
  id_company: number;
  id_result_key: number;
  id_user: number;
}

export interface GetKeyResultsUpdatesHistoryResponse {
  value: number;
  date: string; // ISO string
  user: string;
  comment: string | null;
}

export interface IGetKeyResultsUpdatesHistoryGatewayDependencies {
  resultKeyRepository: IResultKeyRepository;
  resultKeyUpdateRepository: IResultKeyUpdateRepository;
  logging: typeof import('@configs/logger').logger;
}

export interface IGetKeyResultsUpdatesHistoryGateway {
  findResultKey(
    criteria: FindResultKeyCriteria
  ): Promise<ResultKeyEntity | null>;
  findUpdatesByResultKey(
    criteria: FindResultKeyUpdateCriteria
  ): Promise<ResultKeyUpdateEntity[]>;
}

export interface IGetKeyResultsUpdatesHistoryInteractorDependencies {
  gateway: IGetKeyResultsUpdatesHistoryGateway;
  presenter: IPresenter;
  // userCompanyValidator: UserCompanyValidationInteractor;
}

export interface IGetKeyResultsUpdatesHistoryInteractor {
  execute(params: InputGetKeyResultsUpdatesHistory): Promise<HttpResponse>;
}

export interface IGetKeyResultsUpdatesHistoryController {
  getKeyResultsUpdatesHistory(
    request: UserPayload,
    response: Response
  ): Promise<Response>;
}
