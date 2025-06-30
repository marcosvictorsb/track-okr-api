import { IPresenter } from '@protocols/presenter';
import { FindTeamCriteria, ITeamRepository } from './default.interfaces';
import { DataLogOutput } from '@adapters/services';
import { TeamEntity } from '../entity/team.entity';
import {
  IUserRepository,
  FindUserCriteria
} from '@domains/api/users/interfaces';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { logger } from '@configs/logger';
import { HttpResponse } from '@protocols/http';
import { UserCompanyValidationInteractor } from '@domains/common';

export type InputGetTeam = {
  id_company: number;
  id_user: number;
  limite?: number;
  name?: string;
};

export type GetTeamInteractorDependencies = {
  gateway: IGetTeamGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

export type IGetTeamGatewayDependencies = {
  teamRepository: ITeamRepository;
  userRepository: IUserRepository;
  logging: typeof logger;
};

export type GetTeamControllerDependencies = {
  interactor: {
    execute(input: InputGetTeam): Promise<HttpResponse>;
  };
};

export interface IGetTeamGateway {
  findTeam(criteria: FindTeamCriteria): Promise<TeamEntity[] | undefined>;
  findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}
