import { logger } from '@configs/logger';
import { UserCompanyValidationGatewayDependencies } from '../interfaces';
import { UserCompanyValidationInteractor } from '../usecases';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import UserModel from '@domains/api/users/model/user.model';
import { UserCompanyValidationGateway } from '../gateways/user.company.validation.gateway';

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
