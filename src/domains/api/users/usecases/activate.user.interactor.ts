import { HttpResponse } from '@protocols/http';
import {
  ActivateUserInteractorDependencies,
  InputActivateUser,
  IActivateUserGateway
} from '../interfaces/activate.user.interface';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';

export class ActivateUserInteractor {
  protected gateway: IActivateUserGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: ActivateUserInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  async execute(input: InputActivateUser): Promise<HttpResponse> {
    try {
      const { id_user_to_activate, id_company, id_user } = input;

      this.gateway.loggerInfo('Iniciando ativação do usuário', {
        data: JSON.stringify({ id_user_to_activate, id_company, id_user })
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

      // 2. Buscar o usuário que está fazendo a requisição
      const requestingUser = await this.gateway.findUser({ id: id_user });
      if (!requestingUser) {
        this.gateway.loggerInfo('Usuário solicitante não encontrado', {
          id_user
        });
        return this.presenter.notFound('Usuário não encontrado');
      }

      // 3. Buscar o usuário a ser ativado
      const userToActivate = await this.gateway.findUser({
        id: id_user_to_activate,
        id_company
      });
      if (!userToActivate) {
        this.gateway.loggerInfo('Usuário a ser ativado não encontrado', {
          data: JSON.stringify({ id_user_to_activate, id_company })
        });
        return this.presenter.notFound('Usuário a ser ativado não encontrado');
      }

      // 4. Verificar se pode ativar o usuário
      const canActivate = await this.gateway.canActivateUser(
        userToActivate,
        requestingUser
      );
      if (!canActivate.canActivateUser) {
        this.gateway.loggerInfo('Sem permissão para ativar o usuário', {
          data: JSON.stringify({
            id_user_to_activate,
            requesting_user: id_user,
            message: canActivate.message
          })
        });
        return this.presenter.forbidden(
          canActivate.message || 'Sem permissão para ativar este usuário'
        );
      }

      // 5. Ativar o usuário
      const activated = await this.gateway.activateUser({
        id: id_user_to_activate
      });

      if (!activated) {
        this.gateway.loggerError('Erro ao ativar o usuário', {
          data: JSON.stringify({ id_user_to_activate })
        });
        return this.presenter.serverError('Erro ao ativar o usuário');
      }

      this.gateway.loggerInfo('Usuário ativado com sucesso', {
        data: JSON.stringify({ id_user_to_activate, activated_by: id_user })
      });

      return this.presenter.ok({
        message: 'Usuário ativado com sucesso',
        user_id: id_user_to_activate
      });
    } catch (error) {
      this.gateway.loggerError('Erro ao ativar o usuário', {
        error: String(error)
      });
      return this.presenter.serverError('Erro ao ativar o usuário');
    }
  }
}
