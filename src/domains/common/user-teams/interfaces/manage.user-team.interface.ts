import { IPresenter } from '@protocols/presenter';
import { UserTeamEntity } from '../entity/user-team.entity';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { TeamEntity } from '@domains/api/teams/entity/team.entity';
import { IUserRepository } from '@domains/api/users/interfaces';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import {
  IUserTeamRepository,
  FindUserTeamCriteria,
  CreateUserTeamCriteria
} from './default.interfaces';
import { DataLogOutput } from '@adapters/services';
import { HttpResponse } from '@protocols/http';
import { logger } from '@configs/logger';
import { UserCompanyValidationInteractor } from '@domains/common';

export enum ActionUserTeam {
  USER_ADD_TEAM = 'user_add_team',
  USER_UPDATED_TEAM = 'user_updated_team',
  TEAM_NOT_FOUND = 'team_not_found',
  NOTHING_TO_DO = 'nothing_to_do',
  REMOVED_USER_FROM_CURRENT_TEAM = 'removed_user_from_current_team'
}

// MANAGE USER TEAM
export type InputManageUserTeam = {
  id_user_to_manage: number;
  id_team?: number;
  id_company: number;
};

export type ManageUserTeamInteractorDependencies = {
  gateway: IManageUserTeamGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

export type ManageUserTeamControllerDependencies = {
  interactor: {
    execute(input: InputManageUserTeam): Promise<HttpResponse>;
  };
};

export interface IManageUserTeamGateway {
  // Métodos para buscar entidades
  findUser(criteria: {
    id?: number;
    id_company?: number;
  }): Promise<UserEntity | undefined>;
  findTeam(criteria: {
    id?: number;
    id_company?: number;
  }): Promise<TeamEntity | undefined>;
  findUserTeam(
    criteria: FindUserTeamCriteria
  ): Promise<UserTeamEntity | undefined>;

  // Métodos específicos para gerenciamento
  findCurrentUserTeam(userId: number): Promise<UserTeamEntity | undefined>;
  createUserTeam(criteria: CreateUserTeamCriteria): Promise<UserTeamEntity>;
  leaveCurrentTeam(userId: number, teamId?: number): Promise<boolean>;

  // Métodos de log
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IManageUserTeamGatewayDependencies {
  userRepository: IUserRepository;
  userTeamRepository: IUserTeamRepository;
  teamRepository: ITeamRepository;
  logging: typeof logger;
}
