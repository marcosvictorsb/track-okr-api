import { logger } from '@configs/logger';
import { ProfileModel } from '@domains/api/profile/model';
import { ProfileRepository } from '@domains/api/profile/repository/profile.repository';
import { UserCompanyValidationInteractor } from '@domains/common';
import { makeGetUserTeamInteractor } from '@domains/common/user-teams/factories';
import UserTeamModel from '@domains/common/user-teams/model/user-team.model';
import { UserTeamRepository } from '@domains/common/user-teams/repository/user-team.repository';
import { UserCompanyValidationGateway } from '@domains/common/validations/gateways/user.company.validation.gateway';
import { Presenter } from '@protocols/presenter';
import { GetUserController } from '../controllers/get.user.controller';
import { GetUserGateway } from '../gateways/get.user.gateway';
import UserModel from '../model/user.model';
import { UserRepository } from '../repository/user.repository';
import { GetUserInteractor } from '../usecases/get.user.interactor';

export const makeGetUserController = (): GetUserController => {
  const userRepository = new UserRepository({ model: UserModel });
  const userTeamRepository = new UserTeamRepository({
    model: UserTeamModel
  });
  const profileRepository = new ProfileRepository({
    model: ProfileModel
  });

  const presenter = new Presenter();

  const gateway = new GetUserGateway({
    userRepository,
    userTeamRepository,
    profileRepository,
    logging: logger
  });

  const gatewayValidation = new UserCompanyValidationGateway({
    userRepository,
    logging: logger
  });

  const interactor = new GetUserInteractor({
    gateway,
    presenter,
    getUserTeamInteractor: makeGetUserTeamInteractor(),
    userCompanyValidator: new UserCompanyValidationInteractor({
      gateway: gatewayValidation
    })
  });

  return new GetUserController({ interactor });
};
