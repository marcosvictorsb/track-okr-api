import { HttpResponse } from '@protocols/http';
import {
  UpdatePlannerInteractorDependencies,
  InputUpdatePlanner,
  IUpdatePlannerGateway
} from '../interfaces';
import { IPresenter } from '@protocols/presenter';

export class UpdatePlannerInteractor {
  protected gateway: IUpdatePlannerGateway;
  protected presenter: IPresenter;

  constructor(params: UpdatePlannerInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
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

      // 1. Buscar o usuário
      const user = await this.gateway.findUser({ id: id_user });
      if (!user) {
        this.gateway.loggerInfo('Usuário não encontrado', { id_user });
        return this.presenter.notFound('Usuário não encontrado');
      }

      // 2. Verificar se o usuário pertence à empresa
      if (user.id_company !== id_company) {
        this.gateway.loggerInfo(
          'Usuário não possui permissão para atualizar planner desta empresa',
          {
            id_company: user.id_company
          }
        );
        return this.presenter.forbidden(
          'Usuário não possui permissão para atualizar planner desta empresa'
        );
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
