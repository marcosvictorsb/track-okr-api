import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';
import {
  CreateResultKeyCriteria,
  IResultKeyRepository
} from './default.interface';
import { ResultKeyEntity } from '../entity/result-key.entity';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { IObjectiveRepository } from '@domains/api/objectives/interfaces';
import { logger } from '@configs/logger';

export interface InputCreateResultKey {
  name: string;
  initial_value: number;
  target_value: number;
  current_value: number;
  unit: string;
  responsible_team_id?: number | null;
  responsible_users: number[];
  id_okr: number;
  id_company: number;
  id_user: number;
}

export interface ICreateResultKeyGateway {
  create(data: CreateResultKeyCriteria): Promise<ResultKeyEntity>;
  validateTeamBelongsToCompany(
    teamId: number,
    companyId: number
  ): Promise<boolean>;
  validateObjectiveBelongsToCompany(
    objectiveId: number,
    companyId: number
  ): Promise<boolean>;
  validateUsersBelongToCompany(
    userIds: number[],
    companyId: number
  ): Promise<boolean>;
  loggerInfo(message: string, data?: Record<string, unknown>): void;
  loggerError(message: string, data?: Record<string, unknown>): void;
}

export interface CreateResultKeyInteractorDependencies {
  gateway: ICreateResultKeyGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
}

export interface CreateResultKeyControllerDependencies {
  interactor: {
    execute(input: InputCreateResultKey): Promise<HttpResponse>;
  };
}

export interface ICreateResultKeyGatewayDependencies {
  resultKeyRepository: IResultKeyRepository;
  teamRepository: ITeamRepository;
  objectiveRepository: IObjectiveRepository;
  logging: typeof logger;
}
