import { CreateProfileGateway } from '../gateways/create.profile.gateway';
import { CreateProfileInteractor } from '../usecases/create.profile.interactor';
import { CreateProfileController } from '../controllers/create.profile.controller';
import { ProfileRepository } from '../repository/profile.repository';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import ProfileModel from '../model/profile.model';
import UserModel from '@domains/api/users/model/user.model';
import { ImageProcessingService } from '@adapters/services/image.processing.service';
import { logger } from '@configs/logger';

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

  // Gateway
  const gateway = new CreateProfileGateway({
    profileRepository,
    userRepository,
    imageProcessingService,
    logging: logger
  });

  // Interactor
  const interactor = new CreateProfileInteractor(gateway);

  // Controller
  const controller = new CreateProfileController(interactor);

  return controller;
}
