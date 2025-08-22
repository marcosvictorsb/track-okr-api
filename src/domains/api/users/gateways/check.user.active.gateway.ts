import {
  ICheckUserActiveGateway,
  ICheckUserActiveGatewayDependencies
} from '../interfaces/check.user.active.interface';
import { UserEntity } from '../entity/user.entity';
import { FindUserCriteria, IUserRepository } from '../interfaces';
import { MixCheckUserActive } from '@adapters/gateways/api/users/check.user.active.gateway';
import { logger } from '@configs/logger';

export interface CheckUserActiveGatewayDependencies {
  userRepository: IUserRepository;
}

export class CheckUserActiveGateway
  extends MixCheckUserActive
  implements ICheckUserActiveGateway
{
  userRepository: IUserRepository;
  logging: typeof logger;

  constructor(params: ICheckUserActiveGatewayDependencies) {
    super(params);
    this.userRepository = params.userRepository;
    this.logging = params.logging;
  }

  async findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined> {
    this.logging.info('Iniciando busca do usuário', { criteria });
    return await this.userRepository.find(criteria);
  }
}
