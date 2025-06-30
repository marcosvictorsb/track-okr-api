import { HttpResponse } from '@protocols/http';
import {
  FindPlannerCriteria,
  GetPlannerInteractorDependencies,
  InputGetPlanner
} from '../interfaces';
import { IPresenter } from '@protocols/presenter';
import { GetPlannerGateway } from '../gateways';

export class GetPlannerInteractor {
  protected gateway: GetPlannerGateway;
  protected presenter: IPresenter;

  constructor(params: GetPlannerInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
  }

  async execute(input: InputGetPlanner): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo('Iniciando a busca dos planejamentos anuais', {
        requestTxt: JSON.stringify(input)
      });
      const { id_user, limite, id_company, year } = input;

      const user = await this.gateway.findUser({ id: id_user });
      if (user && user.id_company !== id_company) {
        this.gateway.loggerInfo('Usuário não pertence a empresa informada', {
          id_user: id_user,
          id_company: id_company
        });
        return this.presenter.forbidden(
          'Usuário não pertence a empresa informada'
        );
      }

      const criteria: FindPlannerCriteria = { id_company, limite, year };
      const planners = await this.gateway.findPlanner(criteria);
      if (!planners) {
        this.gateway.loggerInfo('Nenhum planejamento anual encontrado');
        return this.presenter.ok([]);
      }
      return this.presenter.ok(planners);
    } catch (error) {
      this.gateway.loggerError('Erro ao criar o planejamento anual', { error });
      return this.presenter.serverError('Error ao criar o planejamento anual');
    }
  }
}
