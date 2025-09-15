import { ImageProcessingService } from '@adapters/services/image.processing.service';
import { logger } from '@configs/logger';
import UserModel from '@domains/api/users/model/user.model';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { makeUserCompanyValidationInteractor } from '@domains/common/validations/factories';
import { Presenter } from '@protocols/presenter';
import { CreateProfileController } from '../controllers/create.profile.controller';
import { CreateProfileGateway } from '../gateways/create.profile.gateway';
import ProfileModel from '../model/profile.model';
import { ProfileRepository } from '../repository/profile.repository';
import { CreateProfileInteractor } from '../usecases/create.profile.interactor';

export function makeCreateProfileFactory(): CreateProfileController {
  // Repositórios
  const profileRepository = new ProfileRepository({
    model: ProfileModel
  });

  const userRepository = new UserRepository({
    model: UserModel
  });

  // Serviços
  const imageProcessingService = new ImageProcessingService();
  const presenter = new Presenter();

  // Gateway
  const gateway = new CreateProfileGateway({
    profileRepository,
    userRepository,
    imageProcessingService,
    logging: logger
  });

  // Interactor
  const interactor = new CreateProfileInteractor({
    gateway,
    presenter,
    userCompanyValidator: makeUserCompanyValidationInteractor()
  });

  // Controller
  const controller = new CreateProfileController({
    interactor
  });

  return controller;
}
