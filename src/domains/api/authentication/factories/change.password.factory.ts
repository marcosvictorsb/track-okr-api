import { logger } from '@configs/logger';
import { ChangePasswordController } from '@domains/api/authentication/controllers/change.password.controller';
import { ChangePasswordGateway } from '@domains/api/authentication/gateways/change.password.gateway';
import { IChangePasswordGatewayDependencies } from '@domains/api/authentication/interfaces/change.password.interface';
import { PasswordResetTokenRepository } from '@domains/api/authentication/repository/password-reset-token.repository';
import { ChangePasswordInteractor } from '@domains/api/authentication/usecases/change.password.interactor';
import UserModel from '@domains/api/users/model/user.model';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { Presenter } from '@protocols/presenter';
import { Resend } from 'resend';

export const makeChangePasswordController = (): ChangePasswordController => {
  const userRepository = new UserRepository({ model: UserModel });
  const passwordResetTokenRepository = new PasswordResetTokenRepository();

  const params: IChangePasswordGatewayDependencies = {
    userRepository,
    passwordResetTokenRepository,
    logging: logger,
    resendService: new Resend(process.env.API_KEY_RESEND as string)
  };

  const presenter = new Presenter();
  const gateway = new ChangePasswordGateway(params);
  const interactor = new ChangePasswordInteractor({
    gateway,
    presenter
  });

  return new ChangePasswordController({ interactor });
};
