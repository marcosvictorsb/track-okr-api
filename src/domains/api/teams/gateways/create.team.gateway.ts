import { MixCreateTeam } from '@adapters/gateways/api/teams';
import { logger } from '@configs/logger';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  FindUserCriteria,
  IUserRepository
} from '@domains/api/users/interfaces';
import { TeamEntity } from '../entity/team.entity';
import {
  CreateTeamCriteria,
  FindTeamCriteria,
  ITeamRepository
} from '../interfaces';
import {
  ICreateTeamGateway,
  ICreateTeamGatewayDependencies
} from '../interfaces/create.team.interface';

export class CreateTeamGateway
  extends MixCreateTeam
  implements ICreateTeamGateway
{
  teamRepository: ITeamRepository;
  userRepository: IUserRepository;
  logging: typeof logger;

  constructor(params: ICreateTeamGatewayDependencies) {
    super(params);
    this.teamRepository = params.teamRepository;
    this.userRepository = params.userRepository;
    this.logging = params.logging;
  }

  async findTeam(criteria: FindTeamCriteria): Promise<TeamEntity | undefined> {
    this.logging.info('Buscando o time', { criteria });
    return await this.teamRepository.find(criteria);
  }

  async createTeam(data: CreateTeamCriteria): Promise<TeamEntity> {
    this.logging.info('Criando novo time', { data });
    return await this.teamRepository.create(data);
  }

  async findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined> {
    this.logging.info('Iniciando busca do usuário', { criteria });
    return await this.userRepository.find(criteria);
  }
}
