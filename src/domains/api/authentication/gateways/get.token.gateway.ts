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
import { IProfileRepository } from '@domains/api/profile/interfaces';
import { ProfileEntity } from '@domains/api/profile/entity';

export class AuthenticationGateway
  extends GetTokenMixed
  implements IAuthenticationGateway
{
  userRepository: IUserRepository;
  profileRepository: IProfileRepository;

  constructor(params: IAuthenticationGatewayDependencies) {
    super(params);
    this.userRepository = params.userRepository;
    this.profileRepository = params.profileRepository;
  }

  async findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined> {
    return await this.userRepository.find(criteria);
  }

  async getProfile(userId: number): Promise<ProfileEntity | undefined> {
    return await this.profileRepository.find({
      id_user: userId
    });
  }
}
