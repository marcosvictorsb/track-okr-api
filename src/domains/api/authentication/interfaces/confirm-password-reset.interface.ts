import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { IUserRepository } from '@domains/api/users/interfaces';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { IPasswordResetTokenRepository } from '../repository/password-reset-token.repository';

export type InputConfirmPasswordReset = {
  token: string;
  newPassword: string;
};

export type ConfirmPasswordResetInteractorDependencies = {
  gateway: IConfirmPasswordResetGateway;
  presenter: IPresenter;
};

export type ConfirmPasswordResetControllerDependencies = {
  interactor: {
    execute(input: InputConfirmPasswordReset): Promise<HttpResponse>;
  };
};

export interface IConfirmPasswordResetGateway {
  findValidToken(
    token: string
  ): Promise<{ email: string; expires_at: Date } | null>;
  findUserByEmail(email: string): Promise<UserEntity | undefined>;
  updateUserPassword(email: string, hashedPassword: string): Promise<boolean>;
  markTokenAsUsed(token: string): Promise<boolean>;
  hashPassword(password: string): string;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IConfirmPasswordResetGatewayDependencies {
  userRepository: IUserRepository;
  passwordResetTokenRepository: IPasswordResetTokenRepository;
  logging: typeof logger;
}
