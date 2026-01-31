import { logger } from '@configs/logger';
import { UserCompanyValidationInteractor } from '@domains/common';
import { UserCompanyValidationGateway } from '@domains/common/validations/gateways/user.company.validation.gateway';
import { Presenter } from '@protocols/presenter';
import { ActivateUserController } from '../controllers/activate.user.controller';
import { ActivateUserGateway } from '../gateways/activate.user.gateway';
import UserModel from '../model/user.model';
import { UserRepository } from '../repository/user.repository';
import { ActivateUserInteractor } from '../usecases/activate.user.interactor';

export const makeActivateUserController = (): ActivateUserController => {
  const userRepository = new UserRepository({ model: UserModel });
  const presenter = new Presenter();

  const validationGateway = new UserCompanyValidationGateway({
    userRepository,
    logging: logger
  });

  const userCompanyValidator = new UserCompanyValidationInteractor({
    gateway: validationGateway
  });

  const gateway = new ActivateUserGateway({
    userRepository,
    logging: logger
  });

  const interactor = new ActivateUserInteractor({
    gateway,
    presenter,
    userCompanyValidator
  });

  return new ActivateUserController({ interactor });
};
