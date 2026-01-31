import { MixUserCompanyValidation } from '@adapters/gateways/common/user.company.validation.gateway';
import { logger } from '@configs/logger';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  FindUserCriteria,
  IUserRepository
} from '@domains/api/users/interfaces';
import {
  IUserCompanyValidationGateway,
  UserCompanyValidationGatewayDependencies
} from '../interfaces';

export class UserCompanyValidationGateway
  extends MixUserCompanyValidation
  implements IUserCompanyValidationGateway
{
  userRepository: IUserRepository;
  logging: typeof logger;

  constructor(params: UserCompanyValidationGatewayDependencies) {
    super(params);
    this.userRepository = params.userRepository;
    this.logging = params.logging;
  }

  async findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined> {
    this.logging.info('Buscando o usuário', { criteria });
    return await this.userRepository.find(criteria);
  }
}
