import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { CheckinsEntity } from '@domains/api/checkins/entity/checkins.entity';
import {
  FindCheckinsCriteria,
  ICheckinsRepository
} from '@domains/api/checkins/interfaces';
import { UserCompanyValidationInteractor } from '@domains/common';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { Response } from 'express';

export interface InputGetKeyResultPeriodDetail {
  kr_id: number;
  period: string;
  id_company: number;
  id_user: number;
  year: number;
}

export interface IGetKeyResultPeriodDetailController {
  getKeyResultPeriodDetail(
    request: UserPayload,
    response: Response
  ): Promise<Response>;
}

export interface GetKeyResultPeriodDetailControllerDependencies {
  interactor: {
    execute(input: InputGetKeyResultPeriodDetail): Promise<HttpResponse>;
  };
}

export interface IGetKeyResultPeriodDetailGateway {
  getCheckinsByPeriod(
    criteria: FindCheckinsCriteria
  ): Promise<CheckinsEntity[] | undefined>;
  loggerInfo(message: string, meta?: DataLogOutput): void;
  loggerError(message: string, meta?: DataLogOutput): void;
}

export interface GetKeyResultPeriodDetailInteractorDependencies {
  gateway: IGetKeyResultPeriodDetailGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
}

export type IGetKeyResultPeriodDetailGatewayDependencies = {
  checkinRepository: ICheckinsRepository;
  logging: typeof logger;
};
