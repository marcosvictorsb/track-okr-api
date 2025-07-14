import {
  FindUserTeamCriteria,
  IUserTeamRepository
} from '@domains/common/user-teams/interfaces';
import { UserEntity } from '../entity/user.entity';
import {
  IGetUserGateway,
  IGetUserGatewayDependencies,
  FindUserCriteria,
  IUserRepository
} from '../interfaces';
import { MixGetUser } from '@adapters/gateways/api/users';
import { logger } from '@configs/logger';
import { UserTeamEntity } from '@domains/common/user-teams/entity/user-team.entity';
import {
  FindProfileCriteria,
  IProfileRepository
} from '@domains/api/profile/interfaces';
import { ProfileEntity } from '@domains/api/profile/entity';

export class GetUserGateway extends MixGetUser implements IGetUserGateway {
  userRepository: IUserRepository;
  userTeamRepository: IUserTeamRepository;
  profileRepository: IProfileRepository;
  logging: typeof logger;

  constructor(params: IGetUserGatewayDependencies) {
    super(params);
    this.userRepository = params.userRepository;
    this.userTeamRepository = params.userTeamRepository;
    this.profileRepository = params.profileRepository;
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

  async findUserTeams(
    criteria: FindUserTeamCriteria
  ): Promise<UserTeamEntity[]> {
    this.logging.info('Iniciando busca dos relacionamentos user-team', {
      data: JSON.stringify(criteria)
    });
    return await this.userTeamRepository.findAll(criteria);
  }

  async getProfileByIds(
    criteria: FindProfileCriteria
  ): Promise<ProfileEntity[]> {
    this.logging.info('Iniciando busca de perfis por IDs', {
      ids: JSON.stringify(criteria)
    });
    return await this.profileRepository.findAll(criteria);
  }
}
