import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { IUserRepository } from '@domains/api/users/interfaces';
import { UserCompanyValidationInteractor } from '@domains/common';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  FindUserTeamCriteria,
  IUserTeamRepository
} from './default.interfaces';

export type InputUpsertUserTeam = {
  id_user: number;
  id_team: number;
};

export type UpsertUserTeamInteractorDependencies = {
  gateway: IUpsertUserTeamGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

export type UpsertUserTeamControllerDependencies = {
  interactor: {
    execute(input: InputUpsertUserTeam): Promise<HttpResponse>;
  };
};

export interface IUpsertUserTeamGateway {
  upsertUserTeam(criteria: FindUserTeamCriteria): Promise<void>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IUpsertUserTeamGatewayDependencies {
  userTeamRepository: IUserTeamRepository;
  userRepository: IUserRepository;
  teamRepository: ITeamRepository;
  logging: typeof logger;
}
