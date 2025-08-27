import { HttpResponse } from '@protocols/http';
import {
  DeletePlannerInteractorDependencies,
  InputDeletePlanner,
  IDeletePlannerGateway
} from '../interfaces';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';

export class DeletePlannerInteractor {
  protected gateway: IDeletePlannerGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: DeletePlannerInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  async execute(input: InputDeletePlanner): Promise<HttpResponse> {
    try {
      const { id, id_company, id_user } = input;

      this.gateway.loggerInfo('Iniciando exclusão do planejamento anual', {
        id_company,
        id_user
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

      // 3. Verificar se o planner existe
      const existingPlanner = await this.gateway.findPlanner({
        id,
        id_company
      });
      if (!existingPlanner) {
        this.gateway.loggerInfo('Planner não encontrado', { id_company });
        return this.presenter.notFound('Planner não encontrado');
      }

      // verificar se o planner está relacionadom com algum objetivo. Caso estiver não pode deletar
      const hasRelatedObjectives = await this.gateway.hasRelatedObjectives(id);
      if (hasRelatedObjectives) {
        this.gateway.loggerInfo(
          'Não é possível deletar o planner pois está relacionado a objetivos',
          { id_company }
        );
        return this.presenter.badRequest(
          'Não é possível deletar o planner pois está relacionado a objetivos'
        );
      }

      // 4. Deletar o planner logicamente
      const deleted = await this.gateway.deletePlanner({ id });

      if (!deleted) {
        this.gateway.loggerError('Erro ao deletar o planejamento anual', {
          id_company
        });
        return this.presenter.serverError(
          'Erro ao deletar o planejamento anual'
        );
      }

      this.gateway.loggerInfo('Planner deletado com sucesso', { id_company });
      return this.presenter.noContent();
    } catch (error) {
      this.gateway.loggerError('Erro ao deletar o planejamento anual', {
        error: String(error)
      });
      return this.presenter.serverError('Erro ao deletar o planejamento anual');
    }
  }
}
