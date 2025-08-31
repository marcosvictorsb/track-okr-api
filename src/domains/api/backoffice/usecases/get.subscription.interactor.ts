import { HttpResponse } from '@protocols/http';
import { IPresenter } from '@protocols/presenter';
import {
  GetSubscriptionInteractorDependencies,
  IGetSubscriptionGateway,
  InputGetSubscription,
  SubscriptionWithHistory
} from '../interfaces/get.subscription.interfaces';
import { FindSubscriptionsCriteria } from '@domains/common/subscriptions/interfaces/default.interfaces';
import { SubscriptionEntity } from '@domains/common/subscriptions/entity/subscription.entity';
import { PlanEntity } from '../entities/plan.entity';

export class GetSubscriptionInteractor {
  protected presenter: IPresenter;
  protected gateway: IGetSubscriptionGateway;

  constructor(params: GetSubscriptionInteractorDependencies) {
    this.gateway = params.gateway;
    this.presenter = params.presenter;
  }

  async execute(input: InputGetSubscription): Promise<HttpResponse> {
    this.gateway.loggerInfo('Case de uso listar subscriptions iniciado', {
      data: JSON.stringify(input)
    });

    try {
      const {
        page = 1,
        limit = 20,
        status,
        company_id,
        plan_id,
        created_by,
        dateFrom: _dateFrom,
        dateTo: _dateTo,
        includeHistory = true,
        historyLimit = 10
      } = input;

      // Validar parâmetros de paginação
      if (page < 1 || limit < 1 || limit > 100) {
        return this.presenter.badRequest(
          'Parâmetros de paginação inválidos. Page >= 1, Limit entre 1 e 100'
        );
      }

      // Construir critérios de busca
      const criteria: FindSubscriptionsCriteria = {};

      if (status) {
        criteria.status = status;
      }

      if (company_id) {
        criteria.company_id = company_id;
      }

      if (plan_id) {
        criteria.plan_id = plan_id;
      }

      if (created_by) {
        criteria.created_by = created_by;
      }

      // Buscar subscriptions
      const result = await this.gateway.findSubscriptions(
        criteria,
        page,
        limit
      );

      // Buscar histórico para cada subscription se solicitado
      let subscriptionsWithHistory: SubscriptionWithHistory[] = [];

      if (includeHistory) {
        subscriptionsWithHistory = await Promise.all(
          result.subscriptions.map(async (subscription) => {
            const history = await this.gateway.findSubscriptionHistory(
              subscription.id!,
              historyLimit
            );

            // Buscar informações do plano se existir plan_id
            let plan: PlanEntity | undefined = undefined;
            if (subscription.plan_id) {
              plan = await this.gateway.findPlan(subscription.plan_id);
            }

            const subscriptionWithHistory: SubscriptionWithHistory =
              Object.assign(subscription, {
                history,
                plan
              }) as SubscriptionWithHistory;

            return subscriptionWithHistory;
          })
        );
      } else {
        subscriptionsWithHistory = await Promise.all(
          result.subscriptions.map(async (subscription) => {
            // Buscar informações do plano mesmo sem histórico
            let plan: PlanEntity | undefined = undefined;
            if (subscription.plan_id) {
              plan = await this.gateway.findPlan(subscription.plan_id);
            }

            const subscriptionWithHistory: SubscriptionWithHistory =
              Object.assign(subscription, {
                history: [],
                plan
              }) as SubscriptionWithHistory;

            return subscriptionWithHistory;
          })
        );
      }

      this.gateway.loggerInfo('Subscriptions listadas com sucesso', {
        data: `Total: ${result.total}, Page: ${page}, Limit: ${limit}, WithHistory: ${includeHistory}`
      });

      return this.presenter.ok({
        subscriptions: subscriptionsWithHistory,
        pagination: {
          page,
          limit,
          total: result.total,
          totalPages: Math.ceil(result.total / limit)
        },
        stats: this.calculateStats(result.subscriptions),
        meta: {
          includeHistory,
          historyLimit
        }
      });
    } catch (error) {
      this.gateway.loggerError('Erro ao listar subscriptions', {
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        data: JSON.stringify(input)
      });

      return this.presenter.serverError(
        'Erro interno do servidor ao listar subscriptions'
      );
    }
  }

  private calculateStats(subscriptions: SubscriptionEntity[]) {
    const stats = {
      total: subscriptions.length,
      byStatus: {
        trial: 0,
        active: 0,
        canceled: 0,
        expired: 0,
        suspended: 0,
        pending_activation: 0
      },
      byPlan: {} as Record<number, number>,
      withAutoRenew: 0,
      inGracePeriod: 0,
      trialExpiringSoon: 0,
      expiringSoon: 0
    };

    subscriptions.forEach((subscription) => {
      // Status count
      if (
        stats.byStatus[subscription.status as keyof typeof stats.byStatus] !==
        undefined
      ) {
        stats.byStatus[subscription.status as keyof typeof stats.byStatus]++;
      }

      // Plan count
      if (subscription.plan_id) {
        stats.byPlan[subscription.plan_id] =
          (stats.byPlan[subscription.plan_id] || 0) + 1;
      }

      // Additional stats
      if (subscription.auto_renew) stats.withAutoRenew++;
      if (subscription.isInGracePeriod()) stats.inGracePeriod++;

      // Check expiring soon (next 7 days)
      const daysUntilExpiration = subscription.daysUntilExpiration();
      if (
        daysUntilExpiration !== null &&
        daysUntilExpiration <= 7 &&
        daysUntilExpiration > 0
      ) {
        stats.expiringSoon++;
      }

      const daysUntilTrialExpiration = subscription.daysUntilTrialExpiration();
      if (
        daysUntilTrialExpiration !== null &&
        daysUntilTrialExpiration <= 3 &&
        daysUntilTrialExpiration > 0
      ) {
        stats.trialExpiringSoon++;
      }
    });

    return stats;
  }
}
