import { MixGetCurrentSubscription } from '@adapters/gateways/common/subscription/get.current.subscription.gateway';
import { logger } from '@configs/logger';
import { PlanEntity } from '@domains/api/backoffice/entities/plan.entity';
import {
  FindPlansCriteria,
  IPlanRepository
} from '@domains/api/backoffice/interfaces/default.interfaces';
import { SubscriptionEntity } from '@domains/common/subscriptions/entity/subscription.entity';
import { ISubscriptionRepository } from '@domains/common/subscriptions/interfaces';
import {
  IGetCurrentSubscriptionGateway,
  IGetCurrentSubscriptionGatewayDependencies
} from '../interfaces';

export class GetCurrentSubscriptionGateway
  extends MixGetCurrentSubscription
  implements IGetCurrentSubscriptionGateway
{
  logging: typeof logger;
  subscriptionRepository: ISubscriptionRepository;
  planRepository: IPlanRepository;

  constructor(params: IGetCurrentSubscriptionGatewayDependencies) {
    super(params);
    this.logging = params.logging;
    this.subscriptionRepository = params.subscriptionRepository;
    this.planRepository = params.planRepository;
  }

  async findSubscriptionByCompanyId(
    companyId: number
  ): Promise<SubscriptionEntity | undefined> {
    this.logging.info('Buscando subscription por company_id', { companyId });
    return await this.subscriptionRepository.find({ company_id: companyId });
  }

  async findPlan(criteria: FindPlansCriteria): Promise<PlanEntity | undefined> {
    this.logging.info('Buscando plano com critérios', { criteria });
    return await this.planRepository.find(criteria);
  }

  // async calculateUsageStats(
  //   companyId: number,
  //   subscription: SubscriptionEntity
  // ): Promise<UsageStatsEntity> {
  //   this.loggerInfo('Calculando estatísticas de uso', {
  //     companyId,
  //     planId: subscription.plan_id
  //   });

  //   try {
  //     // TODO: Implementar cálculos reais consultando as tabelas correspondentes
  //     // Por enquanto, vou retornar dados mockados para demonstração
  //     const mockUsageStats: UsageStatsEntity = {
  //       users: {
  //         current: 23,
  //         limit: subscription.plan?.max_users || 50,
  //         percentage: 46
  //       },
  //       planners: {
  //         current: 3,
  //         limit: subscription.plan?.max_planners || 10,
  //         percentage: 30
  //       },
  //       teams: {
  //         current: 8,
  //         limit: subscription.plan?.max_teams || 15,
  //         percentage: 53
  //       },
  //       objectives: {
  //         current: 45,
  //         limit: subscription.plan?.max_objectives_per_quarter || 100,
  //         percentage: 45
  //       },
  //       key_results: {
  //         current: 156,
  //         limit:
  //           (subscription.plan?.max_objectives_per_quarter || 100) *
  //           (subscription.plan?.max_key_results_per_objective || 5),
  //         percentage: 31
  //       }
  //     };

  //     // Calcular porcentagens corretas
  //     mockUsageStats.users.percentage = Math.round(
  //       (mockUsageStats.users.current / mockUsageStats.users.limit) * 100
  //     );
  //     mockUsageStats.planners.percentage = Math.round(
  //       (mockUsageStats.planners.current / mockUsageStats.planners.limit) * 100
  //     );
  //     mockUsageStats.teams.percentage = Math.round(
  //       (mockUsageStats.teams.current / mockUsageStats.teams.limit) * 100
  //     );
  //     mockUsageStats.objectives.percentage = Math.round(
  //       (mockUsageStats.objectives.current / mockUsageStats.objectives.limit) *
  //         100
  //     );
  //     mockUsageStats.key_results.percentage = Math.round(
  //       (mockUsageStats.key_results.current /
  //         mockUsageStats.key_results.limit) *
  //         100
  //     );

  //     this.loggerInfo('Estatísticas calculadas com sucesso', {
  //       usageStats: mockUsageStats
  //     });
  //     return mockUsageStats;
  //   } catch (error) {
  //     this.loggerError('Erro ao calcular usage stats', {
  //       companyId,
  //       error: error instanceof Error ? error.message : 'Erro desconhecido'
  //     });
  //     throw error;
  //   }
  // }
}
