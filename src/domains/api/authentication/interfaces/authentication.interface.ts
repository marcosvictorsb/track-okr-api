import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { AuthenticationInteractor } from '@domains/api/authentication/usecases';
import { ProfileEntity } from '@domains/api/profile/entity';
import { IProfileRepository } from '@domains/api/profile/interfaces';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  FindUserCriteria,
  IUserRepository
} from '@domains/api/users/interfaces';
import { UserTeamEntity } from '@domains/common/user-teams/entity/user-team.entity';
import { IUserTeamRepository } from '@domains/common/user-teams/interfaces';

export type InputAuthentication = {
  email: string;
  password: string;
  rememberMe?: boolean;
};

export type IAuthenticationGatewayDependencies = {
  userRepository: IUserRepository;
  profileRepository: IProfileRepository;
  userTeamRepository: IUserTeamRepository;
  logging: typeof logger;
};

export type AuthenticationDependencies = {
  interactor: AuthenticationInteractor;
};

export interface IAuthenticationGateway {
  findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined>;
  getProfile(userId: number): Promise<ProfileEntity | undefined>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
  signToken(user: Partial<FindUserCriteria>): string;
  comparePasswords(password: string, userPassword: string): boolean;
  getUserTeam(userId: number): Promise<UserTeamEntity | undefined>;
}
