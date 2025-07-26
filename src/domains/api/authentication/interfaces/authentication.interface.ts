import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  FindUserCriteria,
  IUserRepository
} from '@domains/api/users/interfaces';
import { logger } from '@configs/logger';
import { DataLogOutput } from '@adapters/services';
import { AuthenticationInteractor } from '@domains/api/authentication/usecases';
import { ProfileEntity } from '@domains/api/profile/entity';
import { IProfileRepository } from '@domains/api/profile/interfaces';

export type IAuthenticationGatewayDependencies = {
  userRepository: IUserRepository;
  profileRepository: IProfileRepository;
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
  signToken(user: Partial<UserEntity>): string;
  comparePasswords(password: string, userPassword: string): boolean;
}
