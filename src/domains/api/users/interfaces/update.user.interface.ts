import { IPresenter } from '@protocols/presenter';
import { UserEntity } from '../entity/user.entity';
import {
  IUserRepository,
  FindUserCriteria,
  UpdateUserCriteria
} from './default.interfaces';
import { DataLogOutput } from '@adapters/services';
import { HttpResponse } from '@protocols/http';
import { logger } from '@configs/logger';
import { UserCompanyValidationInteractor } from '@domains/common';
import { IUserTeamRepository } from '@domains/common/user-teams/interfaces';
import { UserTeamEntity } from '@domains/common/user-teams/entity/user-team.entity';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { TeamEntity } from '@domains/api/teams/entity/team.entity';

export type InputUpdateUser = {
  id: number;
  name?: string;
  email?: string;
  role?: string;
  teamId?: number;
  id_company: number;
  id_user: number;
};

export type UpdateUserInteractorDependencies = {
  gateway: IUpdateUserGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
};

export type UpdateUserControllerDependencies = {
  interactor: {
    execute(input: InputUpdateUser): Promise<HttpResponse>;
  };
};

export interface IUpdateUserGateway {
  findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined>;
  updateUser(
    data: Partial<UpdateUserCriteria>,
    criteria: UpdateUserCriteria
  ): Promise<boolean>;
  canUpdateUser(
    userToUpdate: UserEntity,
    requestingUser: UserEntity,
    updateData: Partial<InputUpdateUser>
  ): Promise<{ canUpdateUser: boolean; message?: string }>;

  // Métodos para user-teams
  findTeam(criteria: {
    id?: number;
    id_company?: number;
  }): Promise<TeamEntity | undefined>;
  findUserTeam(criteria: {
    id_user?: number;
    id_team?: number;
    left_at?: Date | undefined;
  }): Promise<UserTeamEntity | undefined>;
  createUserTeam(criteria: {
    id_user: number;
    id_team: number;
    role_in_team?: string;
    joined_at?: Date;
  }): Promise<UserTeamEntity>;

  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IUpdateUserGatewayDependencies {
  userRepository: IUserRepository;
  userTeamRepository: IUserTeamRepository;
  teamRepository: ITeamRepository;
  logging: typeof logger;
}
