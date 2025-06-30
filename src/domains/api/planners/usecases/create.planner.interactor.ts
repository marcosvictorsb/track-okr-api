import { HttpResponse } from '@protocols/http';
import {
  CreatePlannerInteractorDependencies,
  InputCreatePlanner
} from '../interfaces';
import { IPresenter } from '@protocols/presenter';
import { CreatePlannerGateway } from '../gateways/create.planner.gateway';

export class CreatePlannerInteractor {
  protected gateway: CreatePlannerGateway;
  protected presenter: IPresenter;

  constructor(params: CreatePlannerInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
  }

  async execute(input: InputCreatePlanner): Promise<HttpResponse> {
    try {
      const { description, title, year, id_company, id_user } = input;
      this.gateway.loggerInfo('Iniciando criação do planejamento anual', {
        description,
        title,
        year,
        id_company
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

      const criteria = { title, description, year, id_company };
      const planner = await this.gateway.createPlanner(criteria);
      this.gateway.loggerInfo('Planner criado com sucesso');

      return this.presenter.created(planner);
    } catch (error) {
      this.gateway.loggerError('Erro ao criar o planejamento anual', { error });
      return this.presenter.serverError('Error ao criar o planejamento anual');
    }
  }
}
