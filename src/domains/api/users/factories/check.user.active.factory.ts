import { logger } from '@configs/logger';
import { Presenter } from '@protocols/presenter';
import { CheckUserActiveController } from '../controllers/check.user.active.controller';
import { CheckUserActiveGateway } from '../gateways/check.user.active.gateway';
import UserModel from '../model/user.model';
import { UserRepository } from '../repository/user.repository';
import { CheckUserActiveInteractor } from '../usecases/check.user.active.interactor';

export const makeCheckUserActiveController = () => {
  const userRepository = new UserRepository({ model: UserModel });

  const gateway = new CheckUserActiveGateway({
    userRepository,
    logging: logger
  });

  const presenter = new Presenter();

  const interactor = new CheckUserActiveInteractor({
    gateway,
    presenter
  });

  return new CheckUserActiveController({
    interactor
  });
};
