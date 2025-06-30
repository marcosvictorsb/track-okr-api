import { TeamEntity } from '../entity/team.entity';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import {
  FindTeamCriteria,
  ITeamRepository,
  DeleteTeamCriteria
} from '../interfaces';
import {
  IUserRepository,
  FindUserCriteria
} from '@domains/api/users/interfaces/default.interfaces';
import {
  IDeleteTeamGateway,
  IDeleteTeamGatewayDependencies
} from '../interfaces/delete.team.interface';
import { MixDeleteTeam } from '@adapters/gateways/api/teams';
import { logger } from '@configs/logger';

export class DeleteTeamGateway
  extends MixDeleteTeam
  implements IDeleteTeamGateway
{
  teamRepository: ITeamRepository;
  userRepository: IUserRepository;
  logging: typeof logger;

  constructor(params: IDeleteTeamGatewayDependencies) {
    super(params);
    this.teamRepository = params.teamRepository;
    this.userRepository = params.userRepository;
    this.logging = params.logging;
  }

  async findTeam(criteria: FindTeamCriteria): Promise<TeamEntity | undefined> {
    this.logging.info('Buscando o time', { criteria });
    return await this.teamRepository.find(criteria);
  }

  async deleteTeam(criteria: DeleteTeamCriteria): Promise<boolean> {
    this.logging.info('Deletando o time logicamente', {
      criteria
    });
    return await this.teamRepository.delete(criteria);
  }

  async findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined> {
    this.logging.info('Iniciando busca do usuário', { criteria });
    return await this.userRepository.find(criteria);
  }
}
