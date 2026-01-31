import { logger } from '@configs/logger';
import UserModel from '@domains/api/users/model/user.model';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { Presenter } from '@protocols/presenter';
import { GetProfileController } from '../controllers/get.profile.controller';
import { GetProfileGateway } from '../gateways/get.profile.gateway';
import ProfileModel from '../model/profile.model';
import { ProfileRepository } from '../repository/profile.repository';
import { GetProfileInteractor } from '../usecases/get.profile.interactor';

export function makeGetProfileFactory(): GetProfileController {
  const profileRepository = new ProfileRepository({
    model: ProfileModel
  });

  const userRepository = new UserRepository({
    model: UserModel
  });

  const presenter = new Presenter();

  const gateway = new GetProfileGateway({
    profileRepository,
    userRepository,
    logging: logger
  });

  const interactor = new GetProfileInteractor({
    gateway,
    presenter
  });

  const controller = new GetProfileController({
    interactor
  });

  return controller;
}
