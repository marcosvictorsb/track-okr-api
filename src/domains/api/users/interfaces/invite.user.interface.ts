import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { UserCompanyValidationInteractor } from '@domains/common';
import { UpsertUserTeamInteractor } from '@domains/common/user-teams/usecases';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { UserEntity } from '../entity/user.entity';
import {
  CreateUserCriteria,
  FindUserCriteria,
  IUserRepository
} from './default.interfaces';

export type InputInviteUser = {
  email: string;
  name?: string;
  role?: string;
  teamId?: number;
  id_company: number;
  id_user: number;
};

export type InviteUserInteractorDependencies = {
  gateway: IInviteUserGateway;
  presenter: IPresenter;
  userCompanyValidator: UserCompanyValidationInteractor;
  upsertUserTeamInteractor: UpsertUserTeamInteractor;
};

export type IInviteUserGatewayDependencies = {
  userRepository: IUserRepository;
  teamRepository?: ITeamRepository;
  logging: typeof logger;
};

export type InviteUserControllerDependencies = {
  interactor: {
    execute(input: InputInviteUser): Promise<HttpResponse>;
  };
};

export interface IInviteUserGateway {
  findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined>;
  createUser(data: CreateUserCriteria): Promise<UserEntity>;
  updateTeamUserCount(teamId: number, increment: boolean): Promise<boolean>;
  sendInviteEmail(email: string, activationLink: string): Promise<boolean>;
  generateActivationToken(userId: number): Promise<string>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
  signToken(user: Partial<UserEntity>): string;
}
