import { UserTeamEntity } from '../entity/user-team.entity';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { TeamEntity } from '@domains/api/teams/entity/team.entity';
import {
  IUpdateUserTeamGateway,
  IUpdateUserTeamGatewayDependencies,
  FindUserTeamCriteria,
  UpdateUserTeamCriteria,
  InputUpdateUserTeam,
  IUserTeamRepository
} from '../interfaces';
import { IUserRepository } from '@domains/api/users/interfaces';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { MixUpdateUserTeam } from '@adapters/gateways/api/user-teams';
import { logger } from '@configs/logger';

export class UpdateUserTeamGateway
  extends MixUpdateUserTeam
  implements IUpdateUserTeamGateway
{
  userTeamRepository: IUserTeamRepository;
  userRepository: IUserRepository;
  teamRepository: ITeamRepository;
  logging: typeof logger;

  constructor(params: IUpdateUserTeamGatewayDependencies) {
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

  async updateUserTeam(
    data: Partial<UpdateUserTeamCriteria>,
    criteria: UpdateUserTeamCriteria
  ): Promise<boolean> {
    this.logging.info('Atualizando relacionamento user-team', {
      data,
      criteria
    });
    return await this.userTeamRepository.update(data, criteria);
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

  async canUpdateUserTeam(
    userTeamToUpdate: UserTeamEntity,
    requestingUser: UserEntity,
    updateData: Partial<InputUpdateUserTeam>
  ): Promise<{ canUpdate: boolean; message?: string }> {
    this.logging.info(
      'Verificando permissões para atualizar relacionamento user-team',
      {
        userTeamId: userTeamToUpdate.id,
        requestingUserId: requestingUser.id,
        updateData
      }
    );

    // Verificar se o usuário é admin ou owner da empresa
    if (requestingUser.role === 'admin' || requestingUser.role === 'owner') {
      return { canUpdate: true };
    }

    // Buscar o time para verificar permissões
    const team = await this.teamRepository.find({
      id: userTeamToUpdate.id_team
    });
    if (!team) {
      return {
        canUpdate: false,
        message: 'Time não encontrado'
      };
    }

    // Verificar se o usuário é manager do time
    const managerRelation = await this.userTeamRepository.find({
      id_user: requestingUser.id,
      id_team: team.id,
      left_at: undefined
    });

    if (managerRelation && managerRelation.role_in_team === 'manager') {
      // Manager pode atualizar outros membros, mas não pode se rebaixar
      if (
        userTeamToUpdate.id_user === requestingUser.id &&
        updateData.role_in_team &&
        updateData.role_in_team !== 'manager'
      ) {
        return {
          canUpdate: false,
          message: 'Manager não pode alterar o próprio cargo'
        };
      }
      return { canUpdate: true };
    }

    // Usuário só pode atualizar a si mesmo (dados limitados)
    if (userTeamToUpdate.id_user === requestingUser.id) {
      // Verificar se está tentando alterar role (não permitido)
      if (updateData.role_in_team) {
        return {
          canUpdate: false,
          message: 'Usuário não pode alterar o próprio cargo no time'
        };
      }
      return { canUpdate: true };
    }

    return {
      canUpdate: false,
      message: 'Usuário não possui permissão para atualizar este relacionamento'
    };
  }
}
