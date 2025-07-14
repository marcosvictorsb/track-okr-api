import { Presenter } from '@protocols/presenter';
import { GetUserController } from '../controllers/get.user.controller';
import { GetUserGateway } from '../gateways/get.user.gateway';
import { GetUserInteractor } from '../usecases/get.user.interactor';
import { logger } from '@configs/logger';
import { UserRepository } from '../repository/user.repository';
import UserModel from '../model/user.model';
import { makeGetUserTeamInteractor } from '@domains/common/user-teams/factories';
import { UserTeamRepository } from '@domains/common/user-teams/repository/user-team.repository';
import UserTeamModel from '@domains/common/user-teams/model/user-team.model';
import { ProfileModel } from '@domains/api/profile/model';
import { ProfileRepository } from '@domains/api/profile/repository/profile.repository';

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

  const interactor = new GetUserInteractor({
    gateway,
    presenter,
    getUserTeamInteractor: makeGetUserTeamInteractor()
  });

  return new GetUserController({ interactor });
};
