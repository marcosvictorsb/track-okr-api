import { UserEntity } from '@domains/api/users/entity/user.entity';
import { TeamEntity } from '../entity/team.entity';
import {
  IGetTeamGateway,
  IGetTeamGatewayDependencies,
  FindTeamCriteria,
  ITeamRepository
} from '../interfaces';
import { MixGetTeam } from '@adapters/gateways/api/teams';
import {
  FindUserCriteria,
  IUserRepository
} from '@domains/api/users/interfaces';
import { logger } from '@configs/logger';

export class GetTeamGateway extends MixGetTeam implements IGetTeamGateway {
  teamRepository: ITeamRepository;
  userRepository: IUserRepository;
  logging: typeof logger;

  constructor(params: IGetTeamGatewayDependencies) {
    super(params);
    this.teamRepository = params.teamRepository;
    this.userRepository = params.userRepository;
    this.logging = params.logging;
  }

  async findTeam(
    criteria: FindTeamCriteria
  ): Promise<TeamEntity[] | undefined> {
    this.logging.info('Iniciando busca dos times', { criteria });
    return await this.teamRepository.findAll(criteria);
  }

  async findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined> {
    this.logging.info('Iniciando busca do usuário', { criteria });
    return await this.userRepository.find(criteria);
  }
}
