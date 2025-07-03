import { Presenter } from '@protocols/presenter';
import { UpdateUserController } from '../controllers/update.user.controller';
import { UpdateUserGateway } from '../gateways/update.user.gateway';
import { UpdateUserInteractor } from '../usecases/update.user.interactor';
import { UserCompanyValidationInteractor } from '@domains/common';
import { UserCompanyValidationGateway } from '@domains/common/validations/gateways/user.company.validation.gateway';
import { logger } from '@configs/logger';
import { UserRepository } from '../repository/user.repository';
import UserModel from '../model/user.model';
import { makeManageUserTeamInteractor } from '@domains/common/user-teams/factories';

export const makeUpdateUserController = (): UpdateUserController => {
  const userRepository = new UserRepository({ model: UserModel });
  const presenter = new Presenter();

  // Criar o gateway para validação
  const validationGateway = new UserCompanyValidationGateway({
    userRepository,
    logging: logger
  });

  const userCompanyValidator = new UserCompanyValidationInteractor({
    gateway: validationGateway
  });

  // Criar o gateway para update de usuário
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
