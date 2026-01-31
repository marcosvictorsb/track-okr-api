import { MixDeleteUserTeam } from '@adapters/gateways/api/user-teams';
import { logger } from '@configs/logger';
import { TeamEntity } from '@domains/api/teams/entity/team.entity';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { IUserRepository } from '@domains/api/users/interfaces';
import { UserTeamEntity } from '../entity/user-team.entity';
import {
  DeleteUserTeamCriteria,
  FindUserTeamCriteria,
  IDeleteUserTeamGateway,
  IDeleteUserTeamGatewayDependencies,
  IUserTeamRepository
} from '../interfaces';

export class DeleteUserTeamGateway
  extends MixDeleteUserTeam
  implements IDeleteUserTeamGateway
{
  userTeamRepository: IUserTeamRepository;
  userRepository: IUserRepository;
  teamRepository: ITeamRepository;
  logging: typeof logger;

  constructor(params: IDeleteUserTeamGatewayDependencies) {
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

  async deleteUserTeam(criteria: DeleteUserTeamCriteria): Promise<boolean> {
    this.logging.info('Deletando relacionamento user-team (físico)', {
      criteria
    });
    return await this.userTeamRepository.delete(criteria);
  }

  async leaveTeam(id_user: number, id_team: number): Promise<boolean> {
    this.logging.info('Usuário saindo do time (soft delete)', {
      id_user,
      id_team
    });
    return false;
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

    if (requestingUser.role === 'admin' || requestingUser.role === 'owner') {
      return { canManage: true };
    }

    const userTeamRelation = await this.userTeamRepository.find({
      id_user: requestingUser.id,
      id_team: team.id
    });

    if (userTeamRelation && userTeamRelation.role_in_team === 'manager') {
      return { canManage: true };
    }

    return {
      canManage: false,
      message: 'Usuário não possui permissão para gerenciar este time'
    };
  }

  async canRemoveUserFromTeam(
    userTeamToRemove: UserTeamEntity,
    requestingUser: UserEntity
  ): Promise<{ canRemove: boolean; message?: string }> {
    this.logging.info('Verificando permissões para remover usuário do time', {
      userTeamId: userTeamToRemove.id,
      requestingUserId: requestingUser.id
    });

    if (requestingUser.role === 'admin' || requestingUser.role === 'owner') {
      return { canRemove: true };
    }

    const team = await this.teamRepository.find({
      id: userTeamToRemove.id_team
    });
    if (!team) {
      return {
        canRemove: false,
        message: 'Time não encontrado'
      };
    }

    const managerRelation = await this.userTeamRepository.find({
      id_user: requestingUser.id,
      id_team: team.id
    });

    if (managerRelation && managerRelation.role_in_team === 'manager') {
      if (
        userTeamToRemove.role_in_team === 'manager' &&
        userTeamToRemove.id_user !== requestingUser.id
      ) {
        return {
          canRemove: false,
          message: 'Manager não pode remover outro manager'
        };
      }
      return { canRemove: true };
    }

    if (userTeamToRemove.id_user === requestingUser.id) {
      return { canRemove: true };
    }

    return {
      canRemove: false,
      message: 'Usuário não possui permissão para remover este membro do time'
    };
  }
}
