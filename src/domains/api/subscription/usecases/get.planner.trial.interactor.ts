import { UserCompanyValidationInteractor } from '@domains/common';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  GetPlannerTrialInteractorDependencies,
  IGetPlannerTrialGateway,
  InputGetPlannerTrial
} from '../interfaces/get.planner.trial.interface';

export class GetPlannerTrialInteractor {
  protected gateway: IGetPlannerTrialGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;

  constructor(params: GetPlannerTrialInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
  }

  public async execute(input: InputGetPlannerTrial): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo('Iniciando busca da subscription atual', {
        requestTxt: JSON.stringify(input)
      });

      const { id_company, id_user } = input;

      const isValidUser = await this.validateUserAndCompany(
        id_user,
        id_company
      );

      if (!isValidUser) {
        return this.presenter.badRequest('Usuário ou empresa inválidos');
      }

      const subscription =
        await this.gateway.findSubscriptionByCompanyId(id_company);

      if (!subscription) {
        this.gateway.loggerInfo(
          'Nenhuma subscription encontrada para a empresa',
          {
            id_company
          }
        );
        return this.presenter.notFound(
          'Nenhuma assinatura encontrada para esta empresa'
        );
      }

      const plan = await this.gateway.findPlan({ id: subscription.plan_id });
      const IsTrial = Boolean(plan?.isTrial);

      return this.presenter.ok({
        is_trial: IsTrial,
        trial_end_date: subscription.trial_end_date
      });
    } catch (error) {
      this.gateway.loggerError('Erro ao processar webhook de pagamento', {
        error: (error as Error).message,
        stack: (error as Error).stack
      });

      return this.presenter.serverError(
        'Erro interno do servidor ao buscar subscription atual'
      );
    }
  }

  private async validateUserAndCompany(
    id_user: number,
    id_company: number
  ): Promise<boolean> {
    const validation = await this.userCompanyValidator.execute({
      id_user,
      id_company
    });

    if (!validation.isValid) {
      this.gateway.loggerInfo('Usuário ou empresa inválidos', {
        id_user,
        id_company
      });
      return false;
    }

    return true;
  }
}
