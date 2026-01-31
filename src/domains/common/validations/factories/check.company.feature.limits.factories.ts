import { logger } from '@configs/logger';
import { PlanModel } from '@domains/api/backoffice/models/plan.model';
import { PlanRepository } from '@domains/api/backoffice/repository/plan.repository';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';
import { ObjectiveRepository } from '@domains/api/objectives/repository/objective.repository';
import PlannerModel from '@domains/api/planners/model/planner.model';
import { PlannerRepository } from '@domains/api/planners/repository/planner.repository';
import ResultKeyModel from '@domains/api/results-keys/model/result-key.model';
import { ResultKeyRepository } from '@domains/api/results-keys/repository/result-key.repository';
import TeamModel from '@domains/api/teams/model/team.model';
import { TeamRepository } from '@domains/api/teams/repository/team.repository';
import UserModel from '@domains/api/users/model/user.model';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import SubscriptionModel from '@domains/common/subscriptions/model/subscription.model';
import { SubscriptionRepository } from '@domains/common/subscriptions/repository/subscription.repository';
import { CheckCompanyFeatureLimitsGateway } from '../gateways/check.company.feature.limits.gateway';
import { ICheckCompanyFeatureLimitsInteractor } from '../interfaces/check.company.feature.limits.interface';
import { CheckCompanyFeatureLimitsInteractor } from '../usecases/check.company.feature.limits.interactor';

export const makeCheckCompanyFeatureLimitsInteractor =
  (): ICheckCompanyFeatureLimitsInteractor => {
    const paramsGateway = {
      subscriptionRepository: new SubscriptionRepository({
        model: SubscriptionModel
      }),
      planRepository: new PlanRepository({ model: PlanModel }),
      plannerRepository: new PlannerRepository({ model: PlannerModel }),
      objectiveRepository: new ObjectiveRepository({ model: ObjectiveModel }),
      resultKeyRepository: new ResultKeyRepository({ model: ResultKeyModel }),
      teamRepository: new TeamRepository({ model: TeamModel }),
      userRepository: new UserRepository({ model: UserModel }),
      logging: logger
    };

    const gateway = new CheckCompanyFeatureLimitsGateway(paramsGateway);
    const paramsInteractor = {
      gateway
    };
    return new CheckCompanyFeatureLimitsInteractor(paramsInteractor);
  };
