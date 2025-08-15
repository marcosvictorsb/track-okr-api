import { MixCheckCompanyFeatureLimits } from '@adapters/gateways/common/check.company.feature.limits.gateway';
import {
  CheckCompanyFeatureLimitsGatewayDependencies,
  FeatureType,
  ICheckCompanyFeatureLimitsGateway,
  InputGetCurrentUsage
} from '../interfaces/check.company.feature.limits.interface';
import {
  FindSubscriptionsCriteria,
  ISubscriptionRepository
} from '@domains/common/subscriptions/interfaces';
import { logger } from '@configs/logger';
import { SubscriptionEntity } from '@domains/common/subscriptions/entity/subscription.entity';
import { PlanEntity } from '@domains/api/backoffice/entities/plan.entity';
import { IPlanRepository } from '@domains/api/backoffice/interfaces/default.interfaces';
import { IPlannerRepository } from '@domains/api/planners/interfaces';
import {
  IObjectiveRepository,
  ObjectiveStatus
} from '@domains/api/objectives/interfaces';
import { IResultKeyRepository } from '@domains/api/results-keys';
import { ITeamRepository } from '@domains/api/teams/interfaces';
import { IUserRepository, UserStatus } from '@domains/api/users/interfaces';

export class CheckCompanyFeatureLimitsGateway
  extends MixCheckCompanyFeatureLimits
  implements ICheckCompanyFeatureLimitsGateway
{
  subscriptionRepository: ISubscriptionRepository;
  planRepository: IPlanRepository;
  plannerRepository: IPlannerRepository;
  objectiveRepository: IObjectiveRepository;
  resultKeyRepository: IResultKeyRepository;
  teamRepository: ITeamRepository;
  userRepository: IUserRepository;
  logging: typeof logger;

  constructor(params: CheckCompanyFeatureLimitsGatewayDependencies) {
    super(params);
    this.subscriptionRepository = params.subscriptionRepository;
    this.planRepository = params.planRepository;
    this.plannerRepository = params.plannerRepository;
    this.objectiveRepository = params.objectiveRepository;
    this.resultKeyRepository = params.resultKeyRepository;
    this.teamRepository = params.teamRepository;
    this.userRepository = params.userRepository;
    this.logging = params.logging;
  }

  async findActiveSubscriptionByCompany(
    criteria: FindSubscriptionsCriteria
  ): Promise<SubscriptionEntity | undefined> {
    this.logging.info('Buscando a assinatura', { criteria });
    return await this.subscriptionRepository.find(criteria);
  }

  async findPlan(
    criteria: FindSubscriptionsCriteria
  ): Promise<PlanEntity | undefined> {
    this.logging.info('Buscando o plano da assinatura', { criteria });
    return await this.planRepository.find(criteria);
  }

  async getCurrentUsage(criteria: InputGetCurrentUsage): Promise<number> {
    const { id_company, feature, year, quarter, id_okr } = criteria;
    this.logging.info('Buscando uso atual da feature', {
      id_company,
      feature
    });

    if (feature === FeatureType.MAX_PLANNERS) {
      this.logging.info('Verificando o uso atual de planejamento anual');
      const currentUsage = await this.plannerRepository.count({
        id_company,
        year
      });

      this.logging.info('Uso atual de planner anual', {
        id_company,
        feature,
        currentUsage
      });
      return currentUsage;
    }

    if (feature === FeatureType.MAX_OBJECTIVES_PER_QUARTER) {
      this.logging.info('Verificando o uso atual de objetivos por trimestre', {
        id_company,
        year,
        quarter
      });
      const currentUsage =
        await this.objectiveRepository.countObjectivesByQuarter({
          id_company,
          year,
          quarter,
          status: ObjectiveStatus.ACTIVE
        });

      this.logging.info('Uso atual de Objetivo por trimestre', {
        id_company,
        feature,
        currentUsage
      });
      return currentUsage;
    }

    if (feature === FeatureType.MAX_KEY_RESULTS_PER_OBJECTIVE) {
      this.logging.info('Verificando o uso atual de resultado chaves', {
        id_okr
      });
      const currentUsage =
        await this.resultKeyRepository.countKeyResultsByObjective({
          id_okr
        });
      this.logging.info(
        `Uso atual de resultado chave para o objetivo ${id_okr}`,
        {
          id_company,
          feature,
          currentUsage
        }
      );
      return currentUsage;
    }

    if (feature === FeatureType.MAX_TEAMS) {
      this.logging.info('Verificando o uso atual de criação de times', {
        id_company
      });
      const currentUsage = await this.teamRepository.countTeams({
        id_company
      });
      this.logging.info(`Uso atual de times`, {
        id_company,
        feature,
        currentUsage
      });
      return currentUsage;
    }

    if (feature === FeatureType.MAX_USER) {
      this.logging.info('Verificando o uso atual de usuários', {
        id_company
      });
      const currentUsage = await this.userRepository.countUsers({
        id_company,
        statuses: [
          UserStatus.ACTIVE,
          UserStatus.PENDING,
          UserStatus.PENDING_ACTIVATION
        ]
      });
      this.logging.info(`Uso atual de usuários`, {
        id_company,
        feature,
        currentUsage
      });
      return currentUsage;
    }

    return 0;
  }
}
