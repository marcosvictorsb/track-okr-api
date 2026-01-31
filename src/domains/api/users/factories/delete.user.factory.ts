import { logger } from '@configs/logger';
import { UserCompanyValidationInteractor } from '@domains/common';
import { UserCompanyValidationGateway } from '@domains/common/validations/gateways/user.company.validation.gateway';
import { Presenter } from '@protocols/presenter';
import { DeleteUserController } from '../controllers/delete.user.controller';
import { DeleteUserGateway } from '../gateways/delete.user.gateway';
import UserModel from '../model/user.model';
import { UserRepository } from '../repository/user.repository';
import { DeleteUserInteractor } from '../usecases/delete.user.interactor';

export const makeDeleteUserController = (): DeleteUserController => {
  const userRepository = new UserRepository({ model: UserModel });
  const presenter = new Presenter();

  const validationGateway = new UserCompanyValidationGateway({
    userRepository,
    logging: logger
  });

  const userCompanyValidator = new UserCompanyValidationInteractor({
    gateway: validationGateway
  });

  const gateway = new DeleteUserGateway({
    userRepository,
    logging: logger
  });

  const interactor = new DeleteUserInteractor({
    gateway,
    presenter,
    userCompanyValidator
  });

  return new DeleteUserController({ interactor });
};
