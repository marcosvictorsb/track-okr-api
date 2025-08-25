import { IPresenter } from '@protocols/presenter';
import { UserEntity } from '../entity/user.entity';
import {
  IUserRepository,
  CreateUserCriteria,
  FindUserCriteria
} from './default.interfaces';
import { DataLogOutput } from '@adapters/services';
import { HttpResponse } from '@protocols/http';
import { logger } from '@configs/logger';
import { UserCompanyValidationInteractor } from '@domains/common';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { UpsertUserTeamInteractor } from '@domains/common/user-teams/usecases';

export type InputInviteUser = {
  email: string;
  name?: string;
  role?: string;
  teamId?: number;
  id_company: number;
  id_user: number; // Usuário que está fazendo o convite
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
