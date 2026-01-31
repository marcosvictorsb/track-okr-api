import { MixUpdateTeam } from '@adapters/gateways/api/teams';
import { logger } from '@configs/logger';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  FindUserCriteria,
  IUserRepository
} from '@domains/api/users/interfaces/default.interfaces';
import { TeamEntity } from '../entity/team.entity';
import {
  FindTeamCriteria,
  ITeamRepository,
  UpdateTeamCriteria
} from '../interfaces';
import {
  IUpdateTeamGateway,
  IUpdateTeamGatewayDependencies
} from '../interfaces/update.team.interface';

export class UpdateTeamGateway
  extends MixUpdateTeam
  implements IUpdateTeamGateway
{
  teamRepository: ITeamRepository;
  userRepository: IUserRepository;
  logging: typeof logger;

  constructor(params: IUpdateTeamGatewayDependencies) {
    super(params);
    this.teamRepository = params.teamRepository;
    this.userRepository = params.userRepository;
    this.logging = params.logging;
  }

  async findTeam(criteria: FindTeamCriteria): Promise<TeamEntity | undefined> {
    this.logging.info('Buscando o time', { criteria });
    return await this.teamRepository.find(criteria);
  }

  async updateTeam(
    data: Partial<UpdateTeamCriteria>,
    criteria: UpdateTeamCriteria
  ): Promise<boolean> {
    this.logging.info('Atualizando o time', {
      criteria,
      data
    });
    return await this.teamRepository.update(data, criteria);
  }

  async findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined> {
    this.logging.info('Iniciando busca do usuário', { criteria });
    return await this.userRepository.find(criteria);
  }
}
