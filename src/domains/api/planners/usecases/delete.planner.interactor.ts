import { UserCompanyValidationInteractor } from '@domains/common';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  DeletePlannerInteractorDependencies,
  IDeletePlannerGateway,
  InputDeletePlanner
} from '../interfaces';

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

      const existingPlanner = await this.gateway.findPlanner({
        id,
        id_company
      });
      if (!existingPlanner) {
        this.gateway.loggerInfo('Planner não encontrado', { id_company });
        return this.presenter.notFound('Planner não encontrado');
      }

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
