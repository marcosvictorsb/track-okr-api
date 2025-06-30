import { HttpResponse } from '@protocols/http';
import {
  UpdatePlannerInteractorDependencies,
  InputUpdatePlanner,
  IUpdatePlannerGateway
} from '../interfaces';
import { IPresenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';

export class UpdatePlannerInteractor {
  protected gateway: IUpdatePlannerGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: UpdatePlannerInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  async execute(input: InputUpdatePlanner): Promise<HttpResponse> {
    try {
      const { id, title, description, year, id_company, id_user } = input;

      this.gateway.loggerInfo('Iniciando atualização do planejamento anual', {
        title,
        description,
        year,
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

      // 3. Verificar se o planner existe
      const existingPlanner = await this.gateway.findPlanner({
        id,
        id_company
      });
      if (!existingPlanner) {
        this.gateway.loggerInfo('Planner não encontrado', { id_company });
        return this.presenter.notFound('Planner não encontrado');
      }

      // 4. Atualizar o planner
      const updateData = { title, description, year, updated_at: new Date() };
      const updated = await this.gateway.updatePlanner(updateData, { id });

      if (!updated) {
        this.gateway.loggerError('Erro ao atualizar o planejamento anual', {
          id_company
        });
        return this.presenter.serverError(
          'Erro ao atualizar o planejamento anual'
        );
      }

      this.gateway.loggerInfo('Planner atualizado com sucesso', { id_company });
      return this.presenter.noContent();
    } catch (error) {
      this.gateway.loggerError('Erro ao atualizar o planejamento anual', {
        error: String(error)
      });
      return this.presenter.serverError(
        'Erro ao atualizar o planejamento anual'
      );
    }
  }
}
