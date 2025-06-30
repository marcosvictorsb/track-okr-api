import { IPresenter } from '@protocols/presenter';
import { TeamEntity } from '../entity/team.entity';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  ITeamRepository,
  FindTeamCriteria,
  DeleteTeamCriteria
} from './default.interfaces';
import {
  IUserRepository,
  FindUserCriteria
} from '@domains/api/users/interfaces/default.interfaces';
import { DataLogOutput } from '@adapters/services';
import { HttpResponse } from '@protocols/http';
import { logger } from '@configs/logger';
import { UserCompanyValidationInteractor } from '@domains/common';

export type InputDeleteTeam = {
  id: number;
  id_company: number;
  id_user: number;
};

export type DeleteTeamInteractorDependencies = {
  gateway: IDeleteTeamGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

export type DeleteTeamControllerDependencies = {
  interactor: {
    execute(input: InputDeleteTeam): Promise<HttpResponse>;
  };
};

export interface IDeleteTeamGateway {
  findTeam(criteria: FindTeamCriteria): Promise<TeamEntity | undefined>;
  deleteTeam(criteria: DeleteTeamCriteria): Promise<boolean>;
  findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IDeleteTeamGatewayDependencies {
  teamRepository: ITeamRepository;
  userRepository: IUserRepository;
  logging: typeof logger;
}
