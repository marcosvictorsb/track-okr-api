import { UserRepository } from '@domains/api/users/repository/user.repository';
import UserModel from '@domains/api/users/model/user.model';
import { PasswordResetTokenRepository } from '@domains/api/authentication/repository/password-reset-token.repository';
import { ConfirmPasswordResetGateway } from '@domains/api/authentication/gateways/confirm-password-reset.gateway';
import { ConfirmPasswordResetInteractor } from '@domains/api/authentication/usecases/confirm-password-reset.interactor';
import { ConfirmPasswordResetController } from '@domains/api/authentication/controllers/confirm-password-reset.controller';
import { Presenter } from '@protocols/presenter';
import { IConfirmPasswordResetGatewayDependencies } from '@domains/api/authentication/interfaces/confirm-password-reset.interface';
import { logger } from '@configs/logger';

export const makeConfirmPasswordResetController =
  (): ConfirmPasswordResetController => {
    const userRepository = new UserRepository({ model: UserModel });
    const passwordResetTokenRepository = new PasswordResetTokenRepository();

    const params: IConfirmPasswordResetGatewayDependencies = {
      userRepository,
      passwordResetTokenRepository,
      logging: logger
    };

    const presenter = new Presenter();
    const gateway = new ConfirmPasswordResetGateway(params);
    const interactor = new ConfirmPasswordResetInteractor({
      gateway,
      presenter
    });

    return new ConfirmPasswordResetController({ interactor });
  };
