import { UserEntity } from '../entity/user.entity';
import {
  IUserRepository,
  CreateUserCriteria,
  FindUserCriteria
} from '../interfaces';
import {
  IInviteUserGateway,
  IInviteUserGatewayDependencies
} from '../interfaces/invite.user.interface';
import { MixInviteUser } from '@adapters/gateways/api/users';
import { logger } from '@configs/logger';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import crypto from 'crypto';

export class InviteUserGateway
  extends MixInviteUser
  implements IInviteUserGateway
{
  userRepository: IUserRepository;
  teamRepository?: ITeamRepository;
  logging: typeof logger;

  constructor(params: IInviteUserGatewayDependencies) {
    super(params);
    this.userRepository = params.userRepository;
    this.teamRepository = params.teamRepository;
    this.logging = params.logging;
  }

  async findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined> {
    this.logging.info('Buscando usuário', { criteria });
    return await this.userRepository.find(criteria);
  }

  async createUser(data: CreateUserCriteria): Promise<UserEntity> {
    this.logging.info('Criando usuário com convite', { email: data.email });
    return await this.userRepository.create(data);
  }

  async updateTeamUserCount(
    teamId: number,
    increment: boolean
  ): Promise<boolean> {
    if (!this.teamRepository) {
      this.logging.warn(
        'TeamRepository não disponível para atualizar contagem'
      );
      return false;
    }

    try {
      this.logging.info(
        `${increment ? 'Incrementando' : 'Decrementando'} usuário no time`,
        { teamId }
      );

      // Buscar o time atual
      const team = await this.teamRepository.find({ id: teamId });
      if (!team) {
        this.logging.error('Time não encontrado', { teamId });
        return false;
      }

      // Calcular nova quantidade
      const newAmount = increment
        ? team.amount_users + 1
        : Math.max(0, team.amount_users - 1);

      // Atualizar o time
      return await this.teamRepository.update(
        { amount_users: newAmount },
        { id: teamId }
      );
    } catch (error) {
      this.logging.error('Erro ao atualizar contagem de usuários do time', {
        teamId,
        increment,
        error: String(error)
      });
      return false;
    }
  }

  async generateActivationToken(userId: number): Promise<string> {
    // Gerar um token seguro para ativação
    const token = crypto.randomBytes(32).toString('hex');
    this.logging.info('Token de ativação gerado', { userId, token });

    return token;
  }
}
