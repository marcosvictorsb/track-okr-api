import { MixDeactivateUser } from '@adapters/gateways/api/users';
import { logger } from '@configs/logger';
import { UserEntity } from '../entity/user.entity';
import {
  FindUserCriteria,
  IDeactivateUserGateway,
  IDeactivateUserGatewayDependencies,
  IUserRepository,
  UpdateUserCriteria,
  UserStatus
} from '../interfaces';

export class DeactivateUserGateway
  extends MixDeactivateUser
  implements IDeactivateUserGateway
{
  userRepository: IUserRepository;
  logging: typeof logger;

  constructor(params: IDeactivateUserGatewayDependencies) {
    super(params);
    this.userRepository = params.userRepository;
    this.logging = params.logging;
  }

  async findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined> {
    this.logging.info('Iniciando busca do usuário', { criteria });
    return await this.userRepository.find(criteria);
  }

  async deactivateUser(criteria: UpdateUserCriteria): Promise<boolean> {
    this.logging.info('Desativando usuário', { criteria });
    return await this.userRepository.update(
      { status: UserStatus.INACTIVE },
      criteria
    );
  }

  async canDeactivateUser(
    userToDeactivate: UserEntity,
    requestingUser: UserEntity
  ): Promise<{ canDeactivateUser: boolean; message?: string }> {
    if (userToDeactivate.id === requestingUser.id) {
      this.logging.warn('Usuário tentando desativar a si mesmo', {
        userToDeactivate: userToDeactivate.id,
        requestingUser: requestingUser.id
      });
      return {
        canDeactivateUser: false,
        message: 'Você não pode desativar a si mesmo'
      };
    }

    if (userToDeactivate.id_company !== requestingUser.id_company) {
      this.logging.warn('Tentativa de desativar usuário de empresa diferente', {
        userToDeactivateCompany: userToDeactivate.id_company,
        requestingUserCompany: requestingUser.id_company
      });
      return { canDeactivateUser: false };
    }

    if (requestingUser.role !== 'admin') {
      this.logging.warn(
        'Usuário sem permissão de admin tentando desativar outro usuário',
        {
          requestingUserRole: requestingUser.role,
          requestingUserId: requestingUser.id
        }
      );
      return {
        canDeactivateUser: false,
        message: 'Apenas administradores podem desativar usuários'
      };
    }

    if (userToDeactivate.status === UserStatus.INACTIVE) {
      this.logging.warn('Tentativa de desativar usuário já inativo', {
        userToDeactivateId: userToDeactivate.id,
        currentStatus: userToDeactivate.status
      });
      return {
        canDeactivateUser: false,
        message: 'O usuário já está desativado'
      };
    }

    return { canDeactivateUser: true };
  }
}
