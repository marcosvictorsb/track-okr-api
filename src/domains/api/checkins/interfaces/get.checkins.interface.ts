import { CheckinsEntity } from '../entity/checkins.entity';
import { ResultKeyEntity } from '../../results-keys/entity/result-key.entity';
import {
  FindResultKeyCriteria,
  IResultKeyRepository
} from '../../results-keys/interfaces/default.interface';
import { Response } from 'express';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { IPresenter } from '@protocols/presenter';
import { HttpResponse } from '@protocols/http';
import { DataLogOutput } from '@adapters/services';
import { FindCheckinsCriteria, ICheckinsRepository } from './default.interface';

export interface InputGetCheckins {
  id_company: number;
  id_result_key: number;
  id_user: number;
}

export interface GetCheckinsResponse {
  value: number;
  date: string; // ISO string
  user: string;
  comment: string | null;
}

export interface IGetCheckinsGatewayDependencies {
  resultKeyRepository: IResultKeyRepository;
  checkinsRepository: ICheckinsRepository;
  logging: typeof import('@configs/logger').logger;
}

export interface IGetCheckinsGateway {
  findResultKey(
    criteria: FindResultKeyCriteria
  ): Promise<ResultKeyEntity | undefined>;
  findUpdatesByResultKey(
    criteria: FindCheckinsCriteria
  ): Promise<CheckinsEntity[]>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IGetCheckinsInteractorDependencies {
  gateway: IGetCheckinsGateway;
  presenter: IPresenter;
  // userCompanyValidator: UserCompanyValidationInteractor;
}

export interface IGetCheckinsInteractor {
  execute(params: InputGetCheckins): Promise<HttpResponse>;
}

export interface IGetCheckinsController {
  getCheckins(request: UserPayload, response: Response): Promise<Response>;
}
