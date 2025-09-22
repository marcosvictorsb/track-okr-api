import { IPresenter } from '@protocols/presenter';
import {
  CheckCompanyFeatureLimitsInput,
  CheckCompanyFeatureLimitsInteractorDependencies,
  ICheckCompanyFeatureLimitsGateway,
  ICheckCompanyFeatureLimitsInteractor
} from '../interfaces/check.company.feature.limits.interface';

export class CheckCompanyFeatureLimitsInteractor
  implements ICheckCompanyFeatureLimitsInteractor
{
  protected gateway: ICheckCompanyFeatureLimitsGateway;
  protected presenter: IPresenter;

  constructor(params: CheckCompanyFeatureLimitsInteractorDependencies) {
    this.gateway = params.gateway;
  }

  async execute(input: CheckCompanyFeatureLimitsInput): Promise<{
    limit: number;
    currentUsage: number;
    isWithinLimit: boolean;
  }> {
    const { id_company, feature, year, quarter, id_okr } = input;

    this.gateway.loggerInfo('Iniciando verificação de limites', {
      input: JSON.stringify(input)
    });

    // 1. Buscar assinatura ativa da empresa
    const subscription = await this.gateway.findActiveSubscriptionByCompany({
      company_id: id_company
    });
    if (!subscription) {
      throw 'Empresa sem assinatura ativa';
    }

    // 2. Buscar plano da assinatura
    const plan = await this.gateway.findPlan({ id: subscription.plan_id });
    if (!plan) {
      throw 'Plano não encontrado';
    }

    // 3. Obter limite do plano para a feature
    const limit = plan[feature];
    if (typeof limit !== 'number') {
      throw this.presenter.serverError(
        'Limite não configurado para esta funcionalidade'
      );
    }

    // 4. Buscar uso atual da feature
    const criteriaCurrenteUsage = {
      id_company,
      feature,
      year: year as number,
      quarter: quarter as number,
      id_okr: id_okr as number
    };
    const currentUsage = await this.gateway.getCurrentUsage(
      criteriaCurrenteUsage
    );

    this.gateway.loggerInfo('Uso atual da feature obtido', {
      id_company,
      feature,
      requestTxt: JSON.stringify(criteriaCurrenteUsage),
      limit,
      isWithinLimit: currentUsage < limit
    });

    return {
      limit,
      currentUsage,
      isWithinLimit: currentUsage < limit
    };
  }
}
