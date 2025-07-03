import { HttpResponse } from '@protocols/http';
import {
  DeleteUserInteractorDependencies,
  InputDeleteUser,
  IDeleteUserGateway
} from '../interfaces';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';
import { UserModelAttributes } from '../model/user.model';

export class DeleteUserInteractor {
  protected gateway: IDeleteUserGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: DeleteUserInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  async execute(input: InputDeleteUser): Promise<HttpResponse> {
    try {
      const { id_user_to_delete, id_company, id_user } = input;

      this.gateway.loggerInfo('Iniciando exclusão do usuário', {
        data: JSON.stringify({ id_user_to_delete, id_company, id_user })
      });

      // 1. Validar usuário e empresa
      const validation = await this.userCompanyValidator.execute({
        id_user,
        id_company
      });

      if (!validation.isValid) {
        this.gateway.loggerError('O usuário ou empresa não é válido', {
          id_company,
          id_user
        });
        return this.presenter.badRequest('O usuário ou empresa não é válido');
      }

      const requestingUser = validation?.user;

      // 3. Buscar o usuário a ser deletado
      const userToDelete = await this.gateway.findUser({
        id: id_user_to_delete,
        id_company
      });
      if (!userToDelete) {
        this.gateway.loggerInfo('Usuário a ser deletado não encontrado', {
          data: JSON.stringify({ id_user_to_delete, id_company })
        });
        return this.presenter.notFound('Usuário a ser deletado não encontrado');
      }

      // 4. Verificar se pode deletar o usuário
      const { canDeleteUser, message } = await this.gateway.canDeleteUser(
        userToDelete,
        requestingUser as UserModelAttributes
      );
      if (!canDeleteUser) {
        this.gateway.loggerInfo('Sem permissão para deletar o usuário', {
          data: JSON.stringify({ id_user_to_delete, requesting_user: id_user })
        });
        return this.presenter.forbidden(
          message ?? 'Sem permissão para deletar este usuário'
        );
      }

      // 5. Deletar o usuário
      const deleted = await this.gateway.deleteUser({ id: id_user_to_delete });

      if (!deleted) {
        this.gateway.loggerError('Erro ao deletar o usuário', {
          data: JSON.stringify({ id_user_to_delete })
        });
        return this.presenter.serverError('Erro ao deletar o usuário');
      }

      this.gateway.loggerInfo('Usuário deletado com sucesso', {
        data: JSON.stringify({ id_user_to_delete, deleted_by: id_user })
      });

      return this.presenter.noContent();
    } catch (error) {
      this.gateway.loggerError('Erro ao deletar o usuário', {
        error: String(error)
      });
      return this.presenter.serverError('Erro ao deletar o usuário');
    }
  }
}
