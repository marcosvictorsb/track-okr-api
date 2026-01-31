import { MixGetUserTeam } from '@adapters/gateways/api/user-teams';
import { logger } from '@configs/logger';
import { TeamEntity } from '@domains/api/teams/entity/team.entity';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { IUserRepository } from '@domains/api/users/interfaces';
import { UserTeamEntity } from '../entity/user-team.entity';
import {
  FindUserTeamCriteria,
  IGetUserTeamGateway,
  IGetUserTeamGatewayDependencies,
  IUserTeamRepository
} from '../interfaces';

export class GetUserTeamGateway
  extends MixGetUserTeam
  implements IGetUserTeamGateway
{
  userTeamRepository: IUserTeamRepository;
  userRepository: IUserRepository;
  teamRepository: ITeamRepository;
  logging: typeof logger;

  constructor(params: IGetUserTeamGatewayDependencies) {
    super(params);
    this.userTeamRepository = params.userTeamRepository;
    this.userRepository = params.userRepository;
    this.teamRepository = params.teamRepository;
    this.logging = params.logging;
  }

  async findUserTeams(
    criteria: FindUserTeamCriteria
  ): Promise<UserTeamEntity[]> {
    this.logging.info('Buscando relacionamentos user-team', { criteria });
    return await this.userTeamRepository.findAll(criteria);
  }

  async findUserTeam(
    criteria: FindUserTeamCriteria
  ): Promise<UserTeamEntity | undefined> {
    this.logging.info('Buscando relacionamento user-team específico', {
      criteria
    });
    return await this.userTeamRepository.find(criteria);
  }

  async findUser(criteria: {
    id?: number;
    id_company?: number;
  }): Promise<UserEntity | undefined> {
    this.logging.info('Buscando usuário', { criteria });
    return await this.userRepository.find(criteria);
  }

  async findTeam(criteria: {
    id?: number;
    id_company?: number;
  }): Promise<TeamEntity | undefined> {
    this.logging.info('Buscando time', { criteria });
    return await this.teamRepository.find(criteria);
  }

  async canViewTeam(
    requestingUser: UserEntity,
    team?: TeamEntity
  ): Promise<{ canView: boolean; message?: string }> {
    this.logging.info('Verificando permissões para visualizar time', {
      userId: requestingUser.id,
      teamId: team?.id
    });

    if (requestingUser.role === 'admin' || requestingUser.role === 'owner') {
      return { canView: true };
    }

    if (!team) {
      return { canView: true };
    }

    const userTeamRelation = await this.userTeamRepository.find({
      id_user: requestingUser.id,
      id_team: team.id
    });

    if (userTeamRelation) {
      return { canView: true };
    }

    return {
      canView: false,
      message: 'Usuário não possui permissão para visualizar este time'
    };
  }
}
