import { Presenter } from '@protocols/presenter';
import { CheckUserActiveGateway } from '../gateways/check.user.active.gateway';
import { UserRepository } from '../repository/user.repository';
import { CheckUserActiveInteractor } from '../usecases/check.user.active.interactor';
import { CheckUserActiveController } from '../controllers/check.user.active.controller';
import UserModel from '../model/user.model';
import { logger } from '@configs/logger';

export const makeCheckUserActiveController = () => {
  // Repository
  const userRepository = new UserRepository({ model: UserModel });

  // Gateway
  const gateway = new CheckUserActiveGateway({
    userRepository,
    logging: logger
  });

  // Presenter
  const presenter = new Presenter();

  // Interactor
  const interactor = new CheckUserActiveInteractor({
    gateway,
    presenter
  });

  // Controller
  return new CheckUserActiveController({
    interactor
  });
};
