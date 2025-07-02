import { Presenter } from '@protocols/presenter';
import { GetUserController } from '../controllers/get.user.controller';
import { GetUserGateway } from '../gateways/get.user.gateway';
import { GetUserInteractor } from '../usecases/get.user.interactor';
import { logger } from '@configs/logger';
import { UserRepository } from '../repository/user.repository';
import UserModel from '../model/user.model';

export const makeGetUserController = (): GetUserController => {
  const userRepository = new UserRepository({ model: UserModel });
  const presenter = new Presenter();

  const gateway = new GetUserGateway({
    userRepository,
    logging: logger
  });

  const interactor = new GetUserInteractor({
    gateway,
    presenter
  });

  return new GetUserController({ interactor });
};
