import { MixDeleteUser } from '@adapters/gateways/api/users';
import { logger } from '@configs/logger';
import { UserEntity } from '../entity/user.entity';
import {
  DeleteUserCriteria,
  FindUserCriteria,
  IDeleteUserGateway,
  IDeleteUserGatewayDependencies,
  IUserRepository
} from '../interfaces';

export class DeleteUserGateway
  extends MixDeleteUser
  implements IDeleteUserGateway
{
  userRepository: IUserRepository;
  logging: typeof logger;

  constructor(params: IDeleteUserGatewayDependencies) {
    super(params);
    this.userRepository = params.userRepository;
    this.logging = params.logging;
  }

  async findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined> {
    this.logging.info('Iniciando busca do usuário', { criteria });
    return await this.userRepository.find(criteria);
  }

  async deleteUser(criteria: DeleteUserCriteria): Promise<boolean> {
    this.logging.info('Deletando usuário', { criteria });
    return await this.userRepository.delete(criteria);
  }

  async canDeleteUser(
    userToDelete: UserEntity,
    requestingUser: UserEntity
  ): Promise<{ canDeleteUser: boolean; message?: string }> {
    if (userToDelete.id === requestingUser.id) {
      this.logging.warn('Usuário tentando deletar a si mesmo', {
        userToDelete: userToDelete.id,
        requestingUser: requestingUser.id
      });
      return {
        canDeleteUser: false,
        message: 'Você não pode deletar a si mesmo'
      };
    }

    if (userToDelete.id_company !== requestingUser.id_company) {
      this.logging.warn('Tentativa de deletar usuário de empresa diferente', {
        userToDeleteCompany: userToDelete.id_company,
        requestingUserCompany: requestingUser.id_company
      });
      return { canDeleteUser: false };
    }

    if (requestingUser.role !== 'admin') {
      this.logging.warn(
        'Usuário sem permissão de admin tentando deletar outro usuário',
        {
          requestingUserRole: requestingUser.role,
          requestingUserId: requestingUser.id
        }
      );
      return {
        canDeleteUser: false,
        message: 'Apenas administradores podem deletar usuários'
      };
    }

    return { canDeleteUser: true };
  }
}
