import { logger } from '@configs/logger';
import UserModel from '@domains/api/users/model/user.model';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { UserCompanyValidationGateway } from '../gateways/user.company.validation.gateway';
import { UserCompanyValidationGatewayDependencies } from '../interfaces';
import { UserCompanyValidationInteractor } from '../usecases';

export const makeUserCompanyValidationInteractor = () => {
  const userRepository = new UserRepository({
    model: UserModel
  });

  const params: UserCompanyValidationGatewayDependencies = {
    userRepository,
    logging: logger
  };

  const gateway = new UserCompanyValidationGateway(params);

  return new UserCompanyValidationInteractor({ gateway });
};
