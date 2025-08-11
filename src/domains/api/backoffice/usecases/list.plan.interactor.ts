import { IPresenter } from '@protocols/presenter';
import { ListPlanGateway } from '../gateway/list.plan.gateway';
import { ListPlanInteractorDepedencies } from '../interfaces/list.plan.interface';
import { HttpResponse } from '@protocols/http';

export class ListPlanInteractor {
  protected gateway: ListPlanGateway;
  protected presenter: IPresenter;

  constructor(params: ListPlanInteractorDepedencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
  }

  async execute(): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo('Iniciando listagem de planos');

      const plans = await this.gateway.findAllPlans();

      return this.presenter.ok(plans);
    } catch (error) {
      this.gateway.loggerError('Erro ao listar planos', {
        error: error instanceof Error ? error.message : error
      });

      return this.presenter.serverError(
        error instanceof Error ? error : new Error('Erro interno do servidor')
      );
    }
  }
}
