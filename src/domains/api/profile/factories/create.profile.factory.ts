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
  const profileRepository = new ProfileRepository({
    model: ProfileModel
  });

  const userRepository = new UserRepository({
    model: UserModel
  });

  const imageProcessingService = new ImageProcessingService();
  const presenter = new Presenter();

  const gateway = new CreateProfileGateway({
    profileRepository,
    userRepository,
    imageProcessingService,
    logging: logger
  });

  const interactor = new CreateProfileInteractor({
    gateway,
    presenter,
    userCompanyValidator: makeUserCompanyValidationInteractor()
  });

  const controller = new CreateProfileController({
    interactor
  });

  return controller;
}
