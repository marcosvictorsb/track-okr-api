import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { TeamEntity } from '@domains/api/teams/entity/team.entity';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { IUserRepository } from '@domains/api/users/interfaces';
import { UserCompanyValidationInteractor } from '@domains/common';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { UserTeamEntity } from '../entity/user-team.entity';
import {
  FindUserTeamCriteria,
  IUserTeamRepository,
  UpdateUserTeamCriteria
} from './default.interfaces';

export type InputUpdateUserTeam = {
  id?: number;
  id_user_to_update?: number;
  id_team?: number;
  role_in_team?: string;
  id_company: number;
  id_user: number;
  s;
};

export type UpdateUserTeamInteractorDependencies = {
  gateway: IUpdateUserTeamGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

export type UpdateUserTeamControllerDependencies = {
  interactor: {
    execute(input: InputUpdateUserTeam): Promise<HttpResponse>;
  };
};

export interface IUpdateUserTeamGateway {
  findUserTeam(
    criteria: FindUserTeamCriteria
  ): Promise<UserTeamEntity | undefined>;
  updateUserTeam(
    data: Partial<UpdateUserTeamCriteria>,
    criteria: UpdateUserTeamCriteria
  ): Promise<boolean>;
  findUser(criteria: {
    id?: number;
    id_company?: number;
  }): Promise<UserEntity | undefined>;
  findTeam(criteria: {
    id?: number;
    id_company?: number;
  }): Promise<TeamEntity | undefined>;
  canManageTeam(
    requestingUser: UserEntity,
    team: TeamEntity
  ): Promise<{ canManage: boolean; message?: string }>;
  canUpdateUserTeam(
    userTeamToUpdate: UserTeamEntity,
    requestingUser: UserEntity,
    updateData: Partial<InputUpdateUserTeam>
  ): Promise<{ canUpdate: boolean; message?: string }>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IUpdateUserTeamGatewayDependencies {
  userTeamRepository: IUserTeamRepository;
  userRepository: IUserRepository;
  teamRepository: ITeamRepository;
  logging: typeof logger;
}
