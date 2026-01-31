import { UserCompanyValidationInteractor } from '@domains/common';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  DeactivateUserInteractorDependencies,
  IDeactivateUserGateway,
  InputDeactivateUser
} from '../interfaces';

export class DeactivateUserInteractor {
  protected gateway: IDeactivateUserGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: DeactivateUserInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  async execute(input: InputDeactivateUser): Promise<HttpResponse> {
    try {
      const { id_user_to_deactivate, id_company, id_user } = input;

      this.gateway.loggerInfo('Iniciando desativação do usuário', {
        data: JSON.stringify({ id_user_to_deactivate, id_company, id_user })
      });

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

      const requestingUser = await this.gateway.findUser({ id: id_user });
      if (!requestingUser) {
        this.gateway.loggerInfo('Usuário solicitante não encontrado', {
          id_user
        });
        return this.presenter.notFound('Usuário não encontrado');
      }

      const userToDeactivate = await this.gateway.findUser({
        id: id_user_to_deactivate,
        id_company
      });
      if (!userToDeactivate) {
        this.gateway.loggerInfo('Usuário a ser desativado não encontrado', {
          data: JSON.stringify({ id_user_to_deactivate, id_company })
        });
        return this.presenter.notFound(
          'Usuário a ser desativado não encontrado'
        );
      }

      const canDeactivate = await this.gateway.canDeactivateUser(
        userToDeactivate,
        requestingUser
      );
      if (!canDeactivate.canDeactivateUser) {
        this.gateway.loggerInfo('Sem permissão para desativar o usuário', {
          data: JSON.stringify({
            id_user_to_deactivate,
            requesting_user: id_user,
            message: canDeactivate.message
          })
        });
        return this.presenter.forbidden(
          canDeactivate.message || 'Sem permissão para desativar este usuário'
        );
      }

      const deactivated = await this.gateway.deactivateUser({
        id: id_user_to_deactivate
      });

      if (!deactivated) {
        this.gateway.loggerError('Erro ao desativar o usuário', {
          data: JSON.stringify({ id_user_to_deactivate })
        });
        return this.presenter.serverError('Erro ao desativar o usuário');
      }

      this.gateway.loggerInfo('Usuário desativado com sucesso', {
        data: JSON.stringify({ id_user_to_deactivate, deactivated_by: id_user })
      });

      return this.presenter.ok({
        message: 'Usuário desativado com sucesso',
        user_id: id_user_to_deactivate
      });
    } catch (error) {
      this.gateway.loggerError('Erro ao desativar o usuário', {
        error: String(error)
      });
      return this.presenter.serverError('Erro ao desativar o usuário');
    }
  }
}
