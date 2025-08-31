import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  DeletePlanInteractorDependencies,
  IDeletePlanGateway,
  InputDeletePlan
} from '../interfaces/delete.plan.interfaces';

export class DeletePlanInteractor {
  protected presenter: IPresenter;
  protected gateway: IDeletePlanGateway;

  constructor(params: DeletePlanInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
  }

  async execute(input: InputDeletePlan): Promise<HttpResponse> {
    this.gateway.loggerInfo(
      'Case de use deletar plano de assinatura iniciado',
      {
        data: input.id.toString()
      }
    );

    const { id } = input;

    // Verificar se o plano existe
    const plan = await this.gateway.findPlan({ id });

    if (!plan) {
      this.gateway.loggerInfo('Plano não encontrado', { data: id.toString() });
      return this.presenter.notFound('Plano não encontrado');
    }

    const hasActiveSubscriptions = await this.gateway.hasActiveSubscriptions(
      plan.id as number
    );

    if (hasActiveSubscriptions) {
      this.gateway.loggerInfo(
        'Não é possível deletar o plano, existem assinaturas ativas associadas a ele',
        { data: id.toString() }
      );
      return this.presenter.badRequest(
        'Não é possível deletar o plano, existem assinaturas ativas associadas a ele'
      );
    }

    // Deletar o plano
    const deleted = await this.gateway.deletePlan(id);

    if (!deleted) {
      this.gateway.loggerError('Erro ao deletar plano', {
        data: id.toString()
      });
      return this.presenter.serverError('Erro ao deletar plano');
    }

    this.gateway.loggerInfo('Plano deletado com sucesso', {
      data: id.toString()
    });
    return this.presenter.ok({ message: 'Plano deletado com sucesso' });
  }
}
