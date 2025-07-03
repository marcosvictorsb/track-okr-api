import { UserTeamEntity } from '../entity/user-team.entity';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { TeamEntity } from '@domains/api/teams/entity/team.entity';
import {
  ICreateUserTeamGateway,
  ICreateUserTeamGatewayDependencies,
  FindUserTeamCriteria,
  CreateUserTeamCriteria,
  IUserTeamRepository
} from '../interfaces';
import { IUserRepository } from '@domains/api/users/interfaces';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { MixCreateUserTeam } from '@adapters/gateways/api/user-teams';
import { logger } from '@configs/logger';

export class CreateUserTeamGateway
  extends MixCreateUserTeam
  implements ICreateUserTeamGateway
{
  userTeamRepository: IUserTeamRepository;
  userRepository: IUserRepository;
  teamRepository: ITeamRepository;
  logging: typeof logger;

  constructor(params: ICreateUserTeamGatewayDependencies) {
    super(params);
    this.userTeamRepository = params.userTeamRepository;
    this.userRepository = params.userRepository;
    this.teamRepository = params.teamRepository;
    this.logging = params.logging;
  }

  async findUserTeam(
    criteria: FindUserTeamCriteria
  ): Promise<UserTeamEntity | undefined> {
    this.logging.info('Buscando relacionamento user-team', { criteria });
    return await this.userTeamRepository.find(criteria);
  }

  async createUserTeam(
    criteria: CreateUserTeamCriteria
  ): Promise<UserTeamEntity> {
    this.logging.info('Criando relacionamento user-team', { criteria });
    return await this.userTeamRepository.create(criteria);
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

  async canManageTeam(
    requestingUser: UserEntity,
    team: TeamEntity
  ): Promise<{ canManage: boolean; message?: string }> {
    this.logging.info('Verificando permissões para gerenciar time', {
      userId: requestingUser.id,
      teamId: team.id
    });

    // Verificar se o usuário é admin ou owner da empresa
    if (requestingUser.role === 'admin' || requestingUser.role === 'owner') {
      return { canManage: true };
    }

    // Verificar se o usuário é manager do time
    const userTeamRelation = await this.userTeamRepository.find({
      id_user: requestingUser.id,
      id_team: team.id,
      left_at: undefined
    });

    if (userTeamRelation && userTeamRelation.role_in_team === 'manager') {
      return { canManage: true };
    }

    return {
      canManage: false,
      message: 'Usuário não possui permissão para gerenciar este time'
    };
  }
}
