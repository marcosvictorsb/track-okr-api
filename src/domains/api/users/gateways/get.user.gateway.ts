import { UserEntity } from '../entity/user.entity';
import {
  IGetUserGateway,
  IGetUserGatewayDependencies,
  FindUserCriteria,
  IUserRepository
} from '../interfaces';
import { MixGetUser } from '@adapters/gateways/api/users';
import { logger } from '@configs/logger';

export class GetUserGateway extends MixGetUser implements IGetUserGateway {
  userRepository: IUserRepository;
  logging: typeof logger;

  constructor(params: IGetUserGatewayDependencies) {
    super(params);
    this.userRepository = params.userRepository;
    this.logging = params.logging;
  }

  async findUsers(
    criteria: FindUserCriteria
  ): Promise<UserEntity[] | undefined> {
    this.logging.info('Iniciando busca dos usuários', { criteria });
    return await this.userRepository.findAll(criteria);
  }

  async findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined> {
    this.logging.info('Iniciando busca do usuário', { criteria });
    return await this.userRepository.find(criteria);
  }
}
