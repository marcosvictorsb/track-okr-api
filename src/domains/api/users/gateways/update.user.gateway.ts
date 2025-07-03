import { UserEntity } from '../entity/user.entity';
import {
  IUpdateUserGateway,
  IUpdateUserGatewayDependencies,
  FindUserCriteria,
  UpdateUserCriteria,
  IUserRepository,
  InputUpdateUser
} from '../interfaces';
import { MixUpdateUser } from '@adapters/gateways/api/users';
import { logger } from '@configs/logger';

export class UpdateUserGateway
  extends MixUpdateUser
  implements IUpdateUserGateway
{
  userRepository: IUserRepository;
  logging: typeof logger;

  constructor(params: IUpdateUserGatewayDependencies) {
    super(params);
    this.userRepository = params.userRepository;
    this.logging = params.logging;
  }

  async findUser(criteria: FindUserCriteria): Promise<UserEntity | undefined> {
    this.logging.info('Iniciando busca do usuário', { criteria });
    return await this.userRepository.find(criteria);
  }

  async updateUser(
    data: Partial<UpdateUserCriteria>,
    criteria: UpdateUserCriteria
  ): Promise<boolean> {
    this.logging.info('Atualizando usuário', { data, criteria });
    return await this.userRepository.update(data, criteria);
  }

  async canUpdateUser(
    userToUpdate: UserEntity,
    requestingUser: UserEntity,
    updateData: Partial<InputUpdateUser>
  ): Promise<{ canUpdateUser: boolean; message?: string }> {
    // 1. Usuários devem pertencer à mesma empresa
    if (userToUpdate.id_company !== requestingUser.id_company) {
      this.logging.warn('Tentativa de atualizar usuário de empresa diferente', {
        userToUpdateCompany: userToUpdate.id_company,
        requestingUserCompany: requestingUser.id_company
      });
      return { canUpdateUser: false };
    }

    // 2. Apenas admins podem editar outros usuários
    if (
      userToUpdate.id !== requestingUser.id &&
      requestingUser.role !== 'admin'
    ) {
      this.logging.warn(
        'Usuário sem permissão de admin tentando editar outro usuário',
        {
          requestingUserRole: requestingUser.role,
          requestingUserId: requestingUser.id,
          userToUpdateId: userToUpdate.id
        }
      );
      return {
        canUpdateUser: false,
        message: 'Apenas administradores podem editar outros usuários'
      };
    }

    // 3. Não pode alterar role se não for admin
    if (updateData.role && requestingUser.role !== 'admin') {
      this.logging.warn('Usuário tentando alterar role sem ser admin', {
        requestingUserRole: requestingUser.role,
        requestingUserId: requestingUser.id
      });
      return {
        canUpdateUser: false,
        message: 'Apenas administradores podem alterar roles'
      };
    }

    // 4. Não pode promover a admin se não for admin
    if (updateData.role === 'admin' && requestingUser.role !== 'admin') {
      this.logging.warn('Usuário tentando promover a admin sem ser admin', {
        requestingUserRole: requestingUser.role,
        requestingUserId: requestingUser.id
      });
      return {
        canUpdateUser: false,
        message: 'Apenas administradores podem promover usuários a admin'
      };
    }

    // 5. Verificar se email já existe (se estiver sendo alterado)
    if (updateData.email && updateData.email !== userToUpdate.email) {
      const existingUser = await this.findUser({
        email: updateData.email,
        id_company: userToUpdate.id_company
      });

      if (existingUser && existingUser.id !== userToUpdate.id) {
        this.logging.warn('Tentativa de usar email já existente', {
          email: updateData.email,
          existingUserId: existingUser.id,
          userToUpdateId: userToUpdate.id
        });
        return {
          canUpdateUser: false,
          message: 'Este email já está sendo usado por outro usuário'
        };
      }
    }

    return { canUpdateUser: true };
  }
}
