import { Presenter } from '@protocols/presenter';
import { GetUserController } from '../controllers/get.user.controller';
import { GetUserGateway } from '../gateways/get.user.gateway';
import { GetUserInteractor } from '../usecases/get.user.interactor';
import { logger } from '@configs/logger';
import { UserRepository } from '../repository/user.repository';
import UserModel from '../model/user.model';
import { makeGetUserTeamInteractor } from '@domains/common/user-teams/factories';

export const makeGetUserController = (): GetUserController => {
  const userRepository = new UserRepository({ model: UserModel });
  const presenter = new Presenter();

  const gateway = new GetUserGateway({
    userRepository,
    logging: logger
  });

  const interactor = new GetUserInteractor({
    gateway,
    presenter,
    getUserTeamInteractor: makeGetUserTeamInteractor()
  });

  return new GetUserController({ interactor });
};
