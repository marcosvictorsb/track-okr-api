import { UserTeamEntity } from '../entity/user-team.entity';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { TeamEntity } from '@domains/api/teams/entity/team.entity';
import {
  IManageUserTeamGateway,
  IManageUserTeamGatewayDependencies,
  FindUserTeamCriteria,
  CreateUserTeamCriteria,
  IUserTeamRepository
} from '../interfaces';
import { IUserRepository } from '@domains/api/users/interfaces';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { MixCreateUserTeam } from '@adapters/gateways/api/user-teams';
import { logger } from '@configs/logger';

export class ManageUserTeamGateway
  extends MixCreateUserTeam
  implements IManageUserTeamGateway
{
  userTeamRepository: IUserTeamRepository;
  userRepository: IUserRepository;
  teamRepository: ITeamRepository;
  logging: typeof logger;

  constructor(params: IManageUserTeamGatewayDependencies) {
    super(params);
    this.userTeamRepository = params.userTeamRepository;
    this.userRepository = params.userRepository;
    this.teamRepository = params.teamRepository;
    this.logging = params.logging;
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

  async findUserTeam(
    criteria: FindUserTeamCriteria
  ): Promise<UserTeamEntity | undefined> {
    this.logging.info('Buscando relacionamento user-team', { criteria });
    return await this.userTeamRepository.find(criteria);
  }

  async findCurrentUserTeam(
    userId: number
  ): Promise<UserTeamEntity | undefined> {
    this.logging.info('Buscando time atual do usuário', { userId });
    return await this.userTeamRepository.find({
      id_user: userId
    });
  }

  async createUserTeam(
    criteria: CreateUserTeamCriteria
  ): Promise<UserTeamEntity> {
    this.logging.info('Criando relacionamento user-team', { criteria });

    // Verificar se já existe uma relação ativa
    const existingUserTeam = await this.userTeamRepository.find({
      id_user: criteria.id_user,
      id_team: criteria.id_team
    });

    if (existingUserTeam) {
      this.logging.warn('Relacionamento user-team já existe', {
        existingUserTeam,
        criteria
      });
      throw new Error(
        `User ${criteria.id_user} is already a member of team ${criteria.id_team}`
      );
    }

    return await this.userTeamRepository.create(criteria);
  }

  async leaveCurrentTeam(
    userId: number,
    fromTeamId?: number
  ): Promise<boolean> {
    this.logging.info('Removendo usuário do time', {
      data: JSON.stringify({ userId, fromTeamId })
    });

    if (fromTeamId) {
      return await this.userTeamRepository.delete({
        id_team: fromTeamId,
        id_user: userId
      });
    } else {
      // Se não foi fornecido o ID do time, buscar o time atual do usuário
      const currentUserTeam = await this.findCurrentUserTeam(userId);
      if (!currentUserTeam) {
        this.logging.warn('Usuário não está em nenhum time', { userId });
        return false;
      }

      return await this.userTeamRepository.delete({
        id_team: currentUserTeam.id_team,
        id_user: userId
      });
    }
  }
}
