import { Presenter } from '@protocols/presenter';
import { DeactivateUserController } from '../controllers/deactivate.user.controller';
import { DeactivateUserGateway } from '../gateways/deactivate.user.gateway';
import { DeactivateUserInteractor } from '../usecases/deactivate.user.interactor';
import { UserCompanyValidationInteractor } from '@domains/common';
import { UserCompanyValidationGateway } from '@domains/common/validations/gateways/user.company.validation.gateway';
import { logger } from '@configs/logger';
import { UserRepository } from '../repository/user.repository';
import UserModel from '../model/user.model';

export const makeDeactivateUserController = (): DeactivateUserController => {
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
  
  const gateway = new DeactivateUserGateway({
    userRepository,
    logging: logger
  });
  
  const interactor = new DeactivateUserInteractor({
    gateway,
    presenter,
    userCompanyValidator
  });
  
  return new DeactivateUserController({ interactor });
};
