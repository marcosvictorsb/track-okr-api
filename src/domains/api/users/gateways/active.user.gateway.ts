import { MixActiveUser } from '@adapters/gateways/api/users';
import { UserEntity } from '../entity/user.entity';
import {
  FindUserCriteria,
  IUserRepository,
  UpdateUserCriteria
} from '../interfaces';
import {
  IActiveUserGateway,
  IActiveUserGatewayDependencies
} from '../interfaces/active.user.interface';

export class ActiveUserGateway
  extends MixActiveUser
  implements IActiveUserGateway
{
  userRepository: IUserRepository;

  constructor(params: IActiveUserGatewayDependencies) {
    super(params);
    this.userRepository = params.userRepository;
  }

  async findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined> {
    return await this.userRepository.find(criteria);
  }

  async activateUser(
    data: UpdateUserCriteria,
    criteria: UpdateUserCriteria
  ): Promise<boolean> {
    return await this.userRepository.update(data, criteria);
  }
}
