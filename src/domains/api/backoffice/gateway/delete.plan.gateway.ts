import {
  IDeletePlanGateway,
  IDeletePlanGatewayDependencies
} from '../interfaces/delete.plan.interfaces';
import {
  FindPlansCriteria,
  IPlanRepository
} from '../interfaces/default.interfaces';
import { PlanEntity } from '../entities/plan.entity';
import { DataLogOutput } from '@adapters/services';
import { logger } from '@configs/logger';
import { ISubscriptionRepository } from '@domains/common/subscriptions/interfaces';

export class DeletePlanGateway implements IDeletePlanGateway {
  protected planRepository: IPlanRepository;
  protected subscriptionRepository: ISubscriptionRepository;
  protected logging: typeof logger;

  constructor(params: IDeletePlanGatewayDependencies) {
    this.planRepository = params.planRepository;
    this.subscriptionRepository = params.subscriptionRepository;
    this.logging = params.logging;
  }

  async findPlan(criteria: FindPlansCriteria): Promise<PlanEntity | undefined> {
    this.logging.info('Searching for plan with criteria', { criteria });
    return await this.planRepository.find(criteria);
  }

  async deletePlan(id: number): Promise<boolean> {
    return await this.planRepository.delete(id);
  }

  async hasActiveSubscriptions(planId: number): Promise<boolean> {
    this.logging.info('Verificando assinaturas ativas para ID do plano', {
      planId
    });

    const count = await this.subscriptionRepository.countActiveByPlanId(planId);

    this.logging.info(
      `Foram encontradas ${count} assinaturas ativas para o ID do plano`
    );

    return count > 0;
  }

  loggerInfo(message: string, data?: DataLogOutput): void {
    this.logging.info(message, data);
  }

  loggerError(message: string, data?: DataLogOutput): void {
    this.logging.error(message, data);
  }
}
