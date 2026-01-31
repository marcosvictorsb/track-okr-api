import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { IUserRepository } from '@domains/api/users/interfaces';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { UserTeamEntity } from '../entity/user-team.entity';
import {
  FindUserTeamCriteria,
  IUserTeamRepository
} from './default.interfaces';

export type InputGetUserTeam = {
  id_company: number;
  id_user?: number;
  id_team?: number;
  id_user_to_find?: number;
  role_in_team?: string;
  include_left?: boolean;
};

export type GetUserTeamInteractorDependencies = {
  gateway: IGetUserTeamGateway;
  presenter: IPresenter;
};

export type GetUserTeamControllerDependencies = {
  interactor: {
    execute(input: InputGetUserTeam): Promise<HttpResponse>;
  };
};

export interface IGetUserTeamGateway {
  findUserTeams(criteria: FindUserTeamCriteria): Promise<UserTeamEntity[]>;
  findUserTeam(
    criteria: FindUserTeamCriteria
  ): Promise<UserTeamEntity | undefined>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IGetUserTeamGatewayDependencies {
  userTeamRepository: IUserTeamRepository;
  userRepository: IUserRepository;
  teamRepository: ITeamRepository;
  logging: typeof logger;
}
