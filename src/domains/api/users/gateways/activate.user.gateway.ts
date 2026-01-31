import { MixActivateUser } from '@adapters/gateways/api/users';
import { logger } from '@configs/logger';
import { UserEntity } from '../entity/user.entity';
import {
  FindUserCriteria,
  IUserRepository,
  UpdateUserCriteria,
  UserStatus
} from '../interfaces';
import {
  IActivateUserGateway,
  IActivateUserGatewayDependencies
} from '../interfaces/activate.user.interface';

export class ActivateUserGateway
  extends MixActivateUser
  implements IActivateUserGateway
{
  userRepository: IUserRepository;
  logging: typeof logger;

  constructor(params: IActivateUserGatewayDependencies) {
    super(params);
    this.userRepository = params.userRepository;
    this.logging = params.logging;
  }

  async findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined> {
    this.logging.info('Iniciando busca do usuário', { criteria });
    return await this.userRepository.find(criteria);
  }

  async activateUser(criteria: UpdateUserCriteria): Promise<boolean> {
    this.logging.info('Ativando usuário', { criteria });
    return await this.userRepository.update(
      { status: UserStatus.ACTIVE },
      criteria
    );
  }

  async canActivateUser(
    userToActivate: UserEntity,
    requestingUser: UserEntity
  ): Promise<{ canActivateUser: boolean; message?: string }> {
    if (userToActivate.id === requestingUser.id) {
      this.logging.warn('Usuário tentando ativar a si mesmo', {
        userToActivate: userToActivate.id,
        requestingUser: requestingUser.id
      });
      return {
        canActivateUser: false,
        message: 'Você não pode ativar a si mesmo'
      };
    }

    if (userToActivate.id_company !== requestingUser.id_company) {
      this.logging.warn('Tentativa de ativar usuário de empresa diferente', {
        userToActivateCompany: userToActivate.id_company,
        requestingUserCompany: requestingUser.id_company
      });
      return { canActivateUser: false };
    }

    if (requestingUser.role !== 'admin') {
      this.logging.warn(
        'Usuário sem permissão de admin tentando ativar outro usuário',
        {
          requestingUserRole: requestingUser.role,
          requestingUserId: requestingUser.id
        }
      );
      return {
        canActivateUser: false,
        message: 'Apenas administradores podem ativar usuários'
      };
    }

    if (userToActivate.status === UserStatus.ACTIVE) {
      this.logging.warn('Tentativa de ativar usuário já ativo', {
        userToActivateId: userToActivate.id,
        currentStatus: userToActivate.status
      });
      return {
        canActivateUser: false,
        message: 'O usuário já está ativo'
      };
    }

    return { canActivateUser: true };
  }
}
