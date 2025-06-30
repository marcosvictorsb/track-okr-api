import { IPresenter } from '@protocols/presenter';
import { TeamEntity } from '../entity/team.entity';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  ITeamRepository,
  FindTeamCriteria,
  UpdateTeamCriteria
} from './default.interfaces';
import {
  IUserRepository,
  FindUserCriteria
} from '@domains/api/users/interfaces/default.interfaces';
import { DataLogOutput } from '@adapters/services';
import { HttpResponse } from '@protocols/http';
import { logger } from '@configs/logger';
import { UserCompanyValidationInteractor } from '@domains/common';

export type InputUpdateTeam = {
  id: number;
  name: string;
  description: string;
  amount_users: number;
  id_company: number;
  id_user: number;
};

export type UpdateTeamInteractorDependencies = {
  gateway: IUpdateTeamGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

export type UpdateTeamControllerDependencies = {
  interactor: {
    execute(input: InputUpdateTeam): Promise<HttpResponse>;
  };
};

export interface IUpdateTeamGateway {
  findTeam(criteria: FindTeamCriteria): Promise<TeamEntity | undefined>;
  updateTeam(
    data: Partial<UpdateTeamCriteria>,
    criteria: UpdateTeamCriteria
  ): Promise<boolean>;
  findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IUpdateTeamGatewayDependencies {
  teamRepository: ITeamRepository;
  userRepository: IUserRepository;
  logging: typeof logger;
}
