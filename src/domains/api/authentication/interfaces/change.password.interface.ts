import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  FindUserCriteria,
  IUserRepository,
  UpdateUserCriteria
} from '@domains/api/users/interfaces';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { Resend } from 'resend';
import { PasswordResetTokenAttributes } from '../model/password-reset-token.model';
import { IPasswordResetTokenRepository } from '../repository/password-reset-token.repository';

export type InputChangePassword = {
  token: string;
  password: string;
};

export type ChangePasswordInteractorDependencies = {
  gateway: IChangePasswordGateway;
  presenter: IPresenter;
};

export type ChangePasswordControllerDependencies = {
  interactor: {
    execute(input: InputChangePassword): Promise<HttpResponse>;
  };
};

export type FindPasswordResetTokenCriteria = {
  token?: string;
  email?: string;
};

export interface IChangePasswordGateway {
  findToken(token: string): Promise<PasswordResetTokenAttributes | undefined>;
  findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined>;
  updateUser(
    data: Partial<UpdateUserCriteria>,
    criteria: UpdateUserCriteria
  ): Promise<boolean>;
  hashPassword(password: string): string;
  markTokenAsUsed(token: string): Promise<boolean>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IChangePasswordGatewayDependencies {
  userRepository: IUserRepository;
  passwordResetTokenRepository: IPasswordResetTokenRepository;
  logging: typeof logger;
  resendService: Resend;
}
