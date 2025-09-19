import { ImageProcessingService } from '@adapters/services/image.processing.service';
import { logger } from '@configs/logger';
import { makeUserCompanyValidationInteractor } from '@domains/common/validations/factories';
import { Presenter } from '@protocols/presenter';
import { DeleteAvatarController } from '../controllers/delete.avatar.controller';
import { DeleteAvatarGateway } from '../gateways/delete.avatar.gateway';
import ProfileModel from '../model/profile.model';
import { ProfileRepository } from '../repository/profile.repository';
import { DeleteAvatarInteractor } from '../usecases/delete.avatar.interactor';

export function makeDeleteAvatarFactory() {
  // Dependencies
  const profileRepository = new ProfileRepository({ model: ProfileModel });
  const imageProcessingService = new ImageProcessingService();
  const presenter = new Presenter();

  // Gateway
  const gateway = new DeleteAvatarGateway({
    profileRepository,
    imageProcessingService,
    logging: logger
  });

  // Interactor
  const interactor = new DeleteAvatarInteractor({
    gateway,
    presenter,
    userCompanyValidator: makeUserCompanyValidationInteractor()
  });

  // Controller
  const controller = new DeleteAvatarController({
    interactor
  });

  return controller;
}
