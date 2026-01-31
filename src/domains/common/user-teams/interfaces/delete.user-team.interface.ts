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
  DeleteUserTeamCriteria,
  FindUserTeamCriteria,
  IUserTeamRepository
} from './default.interfaces';

export type InputDeleteUserTeam = {
  id?: number;
  id_user_to_remove?: number;
  id_team?: number;
  id_company: number;
  id_user: number;
  force_delete?: boolean;
};

export type DeleteUserTeamInteractorDependencies = {
  gateway: IDeleteUserTeamGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

export type DeleteUserTeamControllerDependencies = {
  interactor: {
    execute(input: InputDeleteUserTeam): Promise<HttpResponse>;
  };
};

export interface IDeleteUserTeamGateway {
  findUserTeam(
    criteria: FindUserTeamCriteria
  ): Promise<UserTeamEntity | undefined>;
  deleteUserTeam(criteria: DeleteUserTeamCriteria): Promise<boolean>;
  leaveTeam(id_user: number, id_team: number): Promise<boolean>;
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
  canRemoveUserFromTeam(
    userTeamToRemove: UserTeamEntity,
    requestingUser: UserEntity
  ): Promise<{ canRemove: boolean; message?: string }>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IDeleteUserTeamGatewayDependencies {
  userTeamRepository: IUserTeamRepository;
  userRepository: IUserRepository;
  teamRepository: ITeamRepository;
  logging: typeof logger;
}
