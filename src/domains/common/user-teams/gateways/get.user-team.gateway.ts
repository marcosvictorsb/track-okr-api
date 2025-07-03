import { UserTeamEntity } from '../entity/user-team.entity';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { TeamEntity } from '@domains/api/teams/entity/team.entity';
import {
  IGetUserTeamGateway,
  IGetUserTeamGatewayDependencies,
  FindUserTeamCriteria,
  IUserTeamRepository
} from '../interfaces';
import { IUserRepository } from '@domains/api/users/interfaces';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { MixGetUserTeam } from '@adapters/gateways/api/user-teams';
import { logger } from '@configs/logger';

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

  async findActiveTeamsByUser(id_user: number): Promise<UserTeamEntity[]> {
    this.logging.info('Buscando times ativos do usuário', { id_user });
    return await this.userTeamRepository.findActiveTeamsByUser(id_user);
  }

  async findActiveUsersByTeam(id_team: number): Promise<UserTeamEntity[]> {
    this.logging.info('Buscando usuários ativos do time', { id_team });
    return await this.userTeamRepository.findActiveUsersByTeam(id_team);
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

    // Verificar se o usuário é admin ou owner da empresa
    if (requestingUser.role === 'admin' || requestingUser.role === 'owner') {
      return { canView: true };
    }

    // Se não especificou um time, pode ver apenas seus próprios relacionamentos
    if (!team) {
      return { canView: true };
    }

    // Verificar se o usuário faz parte do time
    const userTeamRelation = await this.userTeamRepository.find({
      id_user: requestingUser.id,
      id_team: team.id,
      left_at: undefined
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
