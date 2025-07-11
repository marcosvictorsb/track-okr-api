import { GetProfileGateway } from '../gateways/get.profile.gateway';
import { GetProfileInteractor } from '../usecases/get.profile.interactor';
import { GetProfileController } from '../controllers/get.profile.controller';
import { ProfileRepository } from '../repository/profile.repository';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import ProfileModel from '../model/profile.model';
import UserModel from '@domains/api/users/model/user.model';
import { Presenter } from '@protocols/presenter';
import { logger } from '@configs/logger';

export function makeGetProfileFactory(): GetProfileController {
  // Repositórios
  const profileRepository = new ProfileRepository({
    model: ProfileModel
  });

  const userRepository = new UserRepository({
    model: UserModel
  });

  // Serviços
  const presenter = new Presenter();

  // Gateway
  const gateway = new GetProfileGateway({
    profileRepository,
    userRepository,
    logging: logger
  });

  // Interactor
  const interactor = new GetProfileInteractor({
    gateway,
    presenter
  });

  // Controller
  const controller = new GetProfileController({
    interactor
  });

  return controller;
}
