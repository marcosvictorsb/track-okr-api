import { logger } from '@configs/logger';
import { RequestPasswordResetController } from '@domains/api/authentication/controllers/request-password-reset.controller';
import { RequestPasswordResetGateway } from '@domains/api/authentication/gateways/request-password-reset.gateway';
import { IRequestPasswordResetGatewayDependencies } from '@domains/api/authentication/interfaces/request-password-reset.interface';
import { PasswordResetTokenRepository } from '@domains/api/authentication/repository/password-reset-token.repository';
import { RequestPasswordResetInteractor } from '@domains/api/authentication/usecases/request-password-reset.interactor';
import UserModel from '@domains/api/users/model/user.model';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { Presenter } from '@protocols/presenter';
import { Resend } from 'resend';

export const makeRequestPasswordResetController =
  (): RequestPasswordResetController => {
    const userRepository = new UserRepository({ model: UserModel });
    const passwordResetTokenRepository = new PasswordResetTokenRepository();

    const params: IRequestPasswordResetGatewayDependencies = {
      userRepository,
      passwordResetTokenRepository,
      logging: logger,
      resendService: new Resend(process.env.API_KEY_RESEND as string)
    };

    const presenter = new Presenter();
    const gateway = new RequestPasswordResetGateway(params);
    const interactor = new RequestPasswordResetInteractor({
      gateway,
      presenter
    });

    return new RequestPasswordResetController({ interactor });
  };
