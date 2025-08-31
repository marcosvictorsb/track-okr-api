import { SubscriptionEntity } from '@domains/common/subscriptions/entity/subscription.entity';
import { SubscriptionHistoryEntity } from '@domains/common/subscriptions/entity/subscription.history.entity';
import { FindSubscriptionsCriteria } from '@domains/common/subscriptions/interfaces';
import { PlanEntity } from '../entities/plan.entity';
import {
  IGetSubscriptionGatewayDependencies,
  IGetSubscriptionGateway
} from '../interfaces/get.subscription.interfaces';

export class GetSubscriptionGateway implements IGetSubscriptionGateway {
  private subscriptionRepository: IGetSubscriptionGatewayDependencies['subscriptionRepository'];
  private subscriptionHistoryRepository: IGetSubscriptionGatewayDependencies['subscriptionHistoryRepository'];
  private planRepository: IGetSubscriptionGatewayDependencies['planRepository'];

  constructor(params: IGetSubscriptionGatewayDependencies) {
    this.subscriptionRepository = params.subscriptionRepository;
    this.subscriptionHistoryRepository = params.subscriptionHistoryRepository;
    this.planRepository = params.planRepository;
  }

  async findSubscriptions(
    criteria: FindSubscriptionsCriteria,
    page?: number,
    limit?: number
  ): Promise<{
    subscriptions: SubscriptionEntity[];
    total: number;
  }> {
    // Buscar todas as assinaturas com os critérios fornecidos
    const allSubscriptions =
      await this.subscriptionRepository.findAll(criteria);

    const total = allSubscriptions.length;

    // Se paginação for fornecida, aplicar
    if (page && limit) {
      const offset = (page - 1) * limit;
      const subscriptions = allSubscriptions.slice(offset, offset + limit);
      return { subscriptions, total };
    }

    return { subscriptions: allSubscriptions, total };
  }

  async findSubscriptionHistory(
    subscriptionId: number,
    limit?: number
  ): Promise<SubscriptionHistoryEntity[]> {
    return this.subscriptionHistoryRepository.findBySubscription(
      subscriptionId,
      {
        limit: limit || 10,
        sort: { field: 'created_at', direction: 'DESC' }
      }
    );
  }

  async findPlan(planId: number): Promise<PlanEntity | undefined> {
    return this.planRepository.find({ id: planId });
  }

  loggerInfo(message: string, data?: unknown): void {
    console.log(`[GetSubscriptionGateway] ${message}`, data);
  }

  loggerError(message: string, error?: unknown): void {
    console.error(`[GetSubscriptionGateway] ERROR: ${message}`, error);
  }
}
