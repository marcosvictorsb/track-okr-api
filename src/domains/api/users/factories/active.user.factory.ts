import { logger } from '@configs/logger';
import { Presenter } from '@protocols/presenter';
import bcrypt from 'bcryptjs';
import { ActiveUserController } from '../controllers/active.user.controller';
import { ActiveUserGateway } from '../gateways';
import UserModel from '../model/user.model';
import { UserRepository } from '../repository/user.repository';
import { ActiveUserInteractor } from '../usecases';

const userRepository = new UserRepository({
  model: UserModel
});

const params = {
  logging: logger,
  userRepository,
  bcrypt
};
const activeUserGateway = new ActiveUserGateway(params);
const interactor = new ActiveUserInteractor({
  gateway: activeUserGateway,
  presenter: new Presenter()
});

export const activeUserController = new ActiveUserController({ interactor });
