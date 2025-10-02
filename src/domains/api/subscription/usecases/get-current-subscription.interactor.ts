import { UserCompanyValidationInteractor } from '@domains/common';
import {
  FeatureType,
  ICheckCompanyFeatureLimitsInteractor
} from '@domains/common/validations/interfaces/check.company.feature.limits.interface';
import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import { Utils } from '@shared/utils/utils';
import {
  GetCurrentSubscriptionInteractorDependencies,
  IGetCurrentSubscriptionGateway,
  InputGetCurrentSubscription
} from '../interfaces/get-current-subscription.interface';

export class GetCurrentSubscriptionInteractor {
  protected gateway: IGetCurrentSubscriptionGateway;
  protected presenter: IPresenter;
  protected userCompanyValidator: UserCompanyValidationInteractor;
  protected checkCompanyFeatureLimits: ICheckCompanyFeatureLimitsInteractor;

  constructor(params: GetCurrentSubscriptionInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
    this.userCompanyValidator = params.userCompanyValidator;
    this.checkCompanyFeatureLimits = params.checkCompanyFeatureLimits;
  }

  public async execute(
    input: InputGetCurrentSubscription
  ): Promise<HttpResponse> {
    try {
      this.gateway.loggerInfo('Iniciando busca da subscription atual', {
        requestTxt: JSON.stringify(input)
      });

      const { id_company, id_user } = input;

      // Validar usuário e empresa
      const isValidUser = await this.validateUserAndCompany(
        id_user,
        id_company
      );

      if (!isValidUser) {
        return this.presenter.badRequest('Usuário ou empresa inválidos');
      }

      // Buscar subscription da empresa
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

      // Calcular estatísticas de uso
      // const usageStats = await this.gateway.calculateUsageStats(
      //   id_company,
      //   subscription
      // );

      // const response = {
      //   subscription,
      //   usage_stats: usageStats
      // };

      // this.gateway.loggerInfo('Subscription atual encontrada com sucesso', {
      //   subscriptionId: subscription.id,
      //   companyId: id_company
      // });

      // Buscar permissões para cada feature
      const usage_stats = {
        users: await this.checkFeaturePermission(
          id_company,
          FeatureType.MAX_USER,
          plan?.max_users as number
        ),
        planners: await this.checkFeaturePermission(
          id_company,
          FeatureType.MAX_PLANNERS,
          plan?.max_planners as number,
          new Date().getFullYear()
        ),
        teams: await this.checkFeaturePermission(
          id_company,
          FeatureType.MAX_TEAMS,
          plan?.max_teams as number
        ),
        objectives: await this.checkFeaturePermission(
          id_company,
          FeatureType.MAX_OBJECTIVES_PER_QUARTER,
          plan?.max_objectives_per_quarter as number,
          new Date().getFullYear(),
          Utils.currentQuarter()
        ),
        resultKeyPerObjective: plan?.max_key_results_per_objective
      };

      return this.presenter.ok({ subscription, plan, usage_stats });
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

  private async checkFeaturePermission(
    id_company: number,
    feature: FeatureType,
    limit: number,
    year?: number,
    quarter?: number
  ): Promise<{
    current: number;
    limit: number;
    percentage: number;
  }> {
    if (feature === FeatureType.MAX_OBJECTIVES_PER_QUARTER) {
      const result = await this.checkCompanyFeatureLimits.execute({
        id_company,
        feature,
        year: year as number,
        quarter
      });

      return {
        current: result.currentUsage,
        limit: limit,
        percentage:
          limit > 0 ? Math.round((result.currentUsage / limit) * 100) : 0
      };
    }

    const result = await this.checkCompanyFeatureLimits.execute({
      id_company,
      feature
    });

    return {
      current: result.currentUsage,
      limit: limit,
      percentage:
        limit > 0 ? Math.round((result.currentUsage / limit) * 100) : 0
    };
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
