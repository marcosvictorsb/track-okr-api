import {
  DeleteObjectiveInteractorDependencies,
  DeleteObjectiveRequest,
  IDeleteObjectiveGateway
} from '@domains/api/objectives/interfaces';
import { UserCompanyValidationInteractor } from '@domains/common';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';

export class DeleteObjectiveInteractor {
  protected gateway: IDeleteObjectiveGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: DeleteObjectiveInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  public async execute(request: DeleteObjectiveRequest): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo('Iniciou a requisição para deletar o objetivo', {
        request
      });
      const { id, id_company, id_user } = request;

      this.gateway.loggerInfo('Iniciando exclusão do planejamento anual', {
        id_company,
        id_user
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

      const existingObjective = await this.gateway.findObjective({
        id,
        id_company
      });
      if (!existingObjective) {
        this.gateway.loggerInfo('Objetivo não encontrado', { id_company, id });
        return this.presenter.notFound('Objetivo não encontrado');
      }

      await this.gateway.delete(id);

      const resultkeys = await this.gateway.findResultKeysByObjective({
        id_okr: id
      });

      if (!resultkeys || resultkeys.length === 0) {
        this.gateway.loggerInfo(
          'Nenhum resultado-chave encontrado para o objetivo',
          { id_company, id }
        );
        return this.presenter.badRequest(
          'Nenhum resultado-chave encontrado para o objetivo'
        );
      }

      const idsResultKeys = resultkeys
        .map((rk) => rk.id)
        .filter((ids) => ids !== undefined) as number[];
      await this.gateway.deleteResultKeys({ ids: idsResultKeys });

      const checkins = await this.gateway.findCheckins({
        ids_result_key: idsResultKeys
      });

      if (!checkins || checkins.length === 0) {
        this.gateway.loggerInfo(
          'Nenhum check-in encontrado para os resultados-chave',
          { id_company, id }
        );
        return this.presenter.noContent();
      }
      await this.gateway.deleteChekins({ ids_result_key: idsResultKeys });

      this.gateway.loggerInfo(
        'Foram deletados o objetivo, resultados-chave e check-ins relacionados'
      );

      return this.presenter.noContent();
    } catch (error) {
      this.gateway.loggerError('Erro ao deletar o objetivo', {
        error: String(error)
      });
      return this.presenter.serverError();
    }
  }
}
