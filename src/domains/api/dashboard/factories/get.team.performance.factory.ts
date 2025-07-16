import { Presenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';
import { UserCompanyValidationGateway } from '@domains/common/validations/gateways/user.company.validation.gateway';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { TeamRepository } from '@domains/api/teams/repository/team.repository';
import { ObjectiveRepository } from '@domains/api/objectives/repository/objective.repository';
import { ResultKeyRepository } from '@domains/api/results-keys/repository/result-key.repository';
import UserModel from '@domains/api/users/model/user.model';
import TeamModel from '@domains/api/teams/model/team.model';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';
import ResultKeyModel from '@domains/api/results-keys/model/result-key.model';
import { logger } from '@configs/logger';

import { GetTeamPerformanceGateway } from '../gateways/get.team.performance.gateway';
import { GetTeamPerformanceInteractor } from '../usecases/get.team.performance.interactor';
import { GetTeamPerformanceController } from '../controllers/get.team.performance.controller';

export function getTeamPerformanceFactory() {
  // Repositories
  const userRepository = new UserRepository({ model: UserModel });
  const teamRepository = new TeamRepository({ model: TeamModel });
  const objectiveRepository = new ObjectiveRepository({
    model: ObjectiveModel
  });
  const resultKeyRepository = new ResultKeyRepository({
    model: ResultKeyModel
  });

  // Validation
  const userCompanyValidationGateway = new UserCompanyValidationGateway({
    userRepository,
    logging: logger
  });

  const userCompanyValidator = new UserCompanyValidationInteractor({
    gateway: userCompanyValidationGateway
  });

  // Main components
  const gateway = new GetTeamPerformanceGateway({
    teamRepository,
    objectiveRepository,
    resultKeyRepository,
    logging: logger
  });

  const presenter = new Presenter();

  const interactor = new GetTeamPerformanceInteractor({
    gateway,
    presenter,
    userCompanyValidator
  });

  const controller = new GetTeamPerformanceController({
    interactor
  });

  return {
    controller,
    interactor,
    gateway
  };
}
