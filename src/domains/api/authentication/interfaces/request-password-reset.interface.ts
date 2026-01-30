import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { IUserRepository } from '@domains/api/users/interfaces';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { Resend } from 'resend';
import { IPasswordResetTokenRepository } from '../repository/password-reset-token.repository';

export type InputRequestPasswordReset = {
  email: string;
};

export type RequestPasswordResetInteractorDependencies = {
  gateway: IRequestPasswordResetGateway;
  presenter: IPresenter;
};

export type RequestPasswordResetControllerDependencies = {
  interactor: {
    execute(input: InputRequestPasswordReset): Promise<HttpResponse>;
  };
};

export interface IRequestPasswordResetGateway {
  findUserByEmail(email: string): Promise<UserEntity | undefined>;
  generateResetToken(): string;
  saveResetToken(
    email: string,
    token: string,
    expiresAt: Date
  ): Promise<boolean>;
  sendPasswordResetEmail(
    email: string,
    resetLink: string,
    userName: string,
    expiryDate: string
  ): Promise<boolean>;
  deleteExistingTokens(email: string): Promise<void>;
  loggerInfo(message: string, data?: DataLogOutput): void;
  loggerError(message: string, data?: DataLogOutput): void;
}

export interface IRequestPasswordResetGatewayDependencies {
  userRepository: IUserRepository;
  passwordResetTokenRepository: IPasswordResetTokenRepository;
  logging: typeof logger;
  resendService: Resend;
}
