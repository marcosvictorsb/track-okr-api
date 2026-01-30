import { GetTokenMixed } from '@adapters/gateways';
import {
  IAuthenticationGateway,
  IAuthenticationGatewayDependencies
} from '@domains/api/authentication/interfaces';
import { ProfileEntity } from '@domains/api/profile/entity';
import { IProfileRepository } from '@domains/api/profile/interfaces';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  FindUserCriteria,
  IUserRepository
} from '@domains/api/users/interfaces';
import { UserTeamEntity } from '@domains/common/user-teams/entity/user-team.entity';
import { IUserTeamRepository } from '@domains/common/user-teams/interfaces';

export class AuthenticationGateway
  extends GetTokenMixed
  implements IAuthenticationGateway
{
  userRepository: IUserRepository;
  profileRepository: IProfileRepository;
  userTeamRepository: IUserTeamRepository;

  constructor(params: IAuthenticationGatewayDependencies) {
    super(params);
    this.userRepository = params.userRepository;
    this.profileRepository = params.profileRepository;
    this.userTeamRepository = params.userTeamRepository;
    this.logging = params.logging;
  }

  async findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined> {
    return await this.userRepository.find(criteria);
  }

  async getProfile(userId: number): Promise<ProfileEntity | undefined> {
    return await this.profileRepository.find({
      id_user: userId
    });
  }

  async getUserTeam(userId: number): Promise<UserTeamEntity | undefined> {
    this.logging.info(`Buscando time do usuário com ID: ${userId}`);
    return this.userTeamRepository.find({ id_user: userId });
  }
}
