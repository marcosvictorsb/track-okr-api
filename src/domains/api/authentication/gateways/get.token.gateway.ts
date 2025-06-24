import { GetTokenMixed } from '@adapters/gateways';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  FindUserCriteria,
  IUserRepository
} from '@domains/api/users/interfaces';
import {
  IAuthenticationGatewayDependencies,
  IAuthenticationGateway
} from '@domains/api/authentication/interfaces';

export class AuthenticationGateway
  extends GetTokenMixed
  implements IAuthenticationGateway
{
  userRepository: IUserRepository;

  constructor(params: IAuthenticationGatewayDependencies) {
    super(params);
    this.userRepository = params.userRepository;
  }

  async findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined> {
    return await this.userRepository.find(criteria);
  }
}
