import { logger } from '@configs/logger';
import { UserCompanyValidationInteractor } from '@domains/common';
import { makeManageUserTeamInteractor } from '@domains/common/user-teams/factories';
import { UserCompanyValidationGateway } from '@domains/common/validations/gateways/user.company.validation.gateway';
import { Presenter } from '@protocols/presenter';
import { UpdateUserController } from '../controllers/update.user.controller';
import { UpdateUserGateway } from '../gateways/update.user.gateway';
import UserModel from '../model/user.model';
import { UserRepository } from '../repository/user.repository';
import { UpdateUserInteractor } from '../usecases/update.user.interactor';

export const makeUpdateUserController = (): UpdateUserController => {
  const userRepository = new UserRepository({ model: UserModel });
  const presenter = new Presenter();

  const validationGateway = new UserCompanyValidationGateway({
    userRepository,
    logging: logger
  });

  const userCompanyValidator = new UserCompanyValidationInteractor({
    gateway: validationGateway
  });

  const gateway = new UpdateUserGateway({
    userRepository,
    logging: logger
  });

  const interactor = new UpdateUserInteractor({
    gateway,
    presenter,
    userCompanyValidator,
    manageUserTeamInteractor: makeManageUserTeamInteractor()
  });

  return new UpdateUserController({ interactor });
};
