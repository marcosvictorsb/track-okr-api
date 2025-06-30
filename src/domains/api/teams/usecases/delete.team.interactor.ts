import { HttpResponse } from '@protocols/http';
import {
  DeleteTeamInteractorDependencies,
  InputDeleteTeam,
  IDeleteTeamGateway
} from '../interfaces/';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';

export class DeleteTeamInteractor {
  protected gateway: IDeleteTeamGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: DeleteTeamInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  async execute(input: InputDeleteTeam): Promise<HttpResponse> {
    try {
      const { id, id_company, id_user } = input;

      this.gateway.loggerInfo('Iniciando exclusão do time', {
        id_company,
        id_user
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

      // Deletar o time logicamente
      const deleted = await this.gateway.deleteTeam({ id });

      if (!deleted) {
        this.gateway.loggerError('Erro ao deletar o time', {
          id_company
        });
        return this.presenter.serverError('Erro ao deletar o time');
      }

      this.gateway.loggerInfo('Time deletado com sucesso', { id_company });
      return this.presenter.noContent();
    } catch (error) {
      this.gateway.loggerError('Erro ao deletar o time', {
        error: String(error)
      });
      return this.presenter.serverError('Erro ao deletar o time');
    }
  }
}
