import { HttpResponse } from '@protocols/http';
import {
  UpdateTeamInteractorDependencies,
  InputUpdateTeam,
  IUpdateTeamGateway
} from '../interfaces';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';

export class UpdateTeamInteractor {
  protected gateway: IUpdateTeamGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: UpdateTeamInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  async execute(input: InputUpdateTeam): Promise<HttpResponse> {
    try {
      const { id, name, description, amount_users, id_company, id_user } =
        input;

      this.gateway.loggerInfo('Iniciando atualização do time', {
        data: JSON.stringify({
          name,
          description,
          amount_users,
          id_company,
          id_user
        })
      });

      // Validar usuário e empresa
      const validation = await this.userCompanyValidator.execute({
        id_user,
        id_company
      });

      if (!validation.isValid) {
        this.gateway.loggerInfo('Usuário ou empresa inválidos', {
          id_user,
          id_company
        });
        return this.presenter.badRequest('Usuário ou empresa inválidos');
      }

      // Verificar se o time existe
      const existingTeam = await this.gateway.findTeam({
        id,
        id_company
      });
      if (!existingTeam) {
        this.gateway.loggerInfo('Time não encontrado', { id_company });
        return this.presenter.notFound('Time não encontrado');
      }

      // Atualizar o time
      const updateData = {
        name,
        description,
        amount_users,
        updated_at: new Date()
      };
      const updated = await this.gateway.updateTeam(updateData, { id });

      if (!updated) {
        this.gateway.loggerError('Erro ao atualizar o time', {
          id_company
        });
        return this.presenter.serverError('Erro ao atualizar o time');
      }

      this.gateway.loggerInfo('Time atualizado com sucesso', { id_company });
      return this.presenter.noContent();
    } catch (error) {
      this.gateway.loggerError('Erro ao atualizar o time', {
        error: String(error)
      });
      return this.presenter.serverError('Erro ao atualizar o time');
    }
  }
}
