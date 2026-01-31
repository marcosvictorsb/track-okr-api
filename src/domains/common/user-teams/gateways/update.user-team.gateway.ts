import { MixUpdateUserTeam } from '@adapters/gateways/api/user-teams';
import { logger } from '@configs/logger';
import { TeamEntity } from '@domains/api/teams/entity/team.entity';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { UserEntity } from '@domains/api/users/entity/user.entity';
import { IUserRepository } from '@domains/api/users/interfaces';
import { UserTeamEntity } from '../entity/user-team.entity';
import {
  FindUserTeamCriteria,
  IUpdateUserTeamGateway,
  IUpdateUserTeamGatewayDependencies,
  IUserTeamRepository,
  UpdateUserTeamCriteria
} from '../interfaces';

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

  async canUpdateUserTeam(
    userTeamToUpdate: UserTeamEntity,
    requestingUser: UserEntity,
    updateData: Partial<UpdateUserTeamCriteria>
  ): Promise<{ canUpdate: boolean; message?: string }> {
    this.logging.info(
      'Verificando permissões para atualizar relacionamento user-team',
      {
        userTeamId: userTeamToUpdate.id,
        requestingUserId: requestingUser.id,
        updateData
      }
    );

    if (requestingUser.role === 'admin' || requestingUser.role === 'owner') {
      return { canUpdate: true };
    }

    const team = await this.teamRepository.find({
      id: userTeamToUpdate.id_team
    });
    if (!team) {
      return {
        canUpdate: false,
        message: 'Time não encontrado'
      };
    }

    const managerRelation = await this.userTeamRepository.find({
      id_user: requestingUser.id,
      id_team: team.id
    });

    if (managerRelation && managerRelation.role_in_team === 'manager') {
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

    if (userTeamToUpdate.id_user === requestingUser.id) {
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
