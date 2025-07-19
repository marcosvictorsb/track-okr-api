import { Presenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';
import { UserCompanyValidationGateway } from '@domains/common/validations/gateways/user.company.validation.gateway';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { TeamRepository } from '@domains/api/teams/repository/team.repository';
import { ObjectiveRepository } from '@domains/api/objectives/repository/objective.repository';
import { ResultKeyRepository } from '@domains/api/results-keys/repository/result-key.repository';
import { CheckinsRepository } from '@domains/api/checkins/repository/checkins.repository';
import UserModel from '@domains/api/users/model/user.model';
import TeamModel from '@domains/api/teams/model/team.model';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';
import ResultKeyModel from '@domains/api/results-keys/model/result-key.model';
import { logger } from '@configs/logger';

import { GetTemporalEvolutionGateway } from '../gateways/get.temporal.evolution.gateway';
import { GetTemporalEvolutionInteractor } from '../usecases/get.temporal.evolution.interactor';
import { GetTemporalEvolutionController } from '../controllers/get.temporal.evolution.controller';
import CheckinsModel from '@domains/api/checkins/model/checkin.model';

export function getTemporalEvolutionFactory() {
  // Repositories
  const userRepository = new UserRepository({ model: UserModel });
  const teamRepository = new TeamRepository({ model: TeamModel });
  const objectiveRepository = new ObjectiveRepository({
    model: ObjectiveModel
  });
  const resultKeyRepository = new ResultKeyRepository({
    model: ResultKeyModel
  });
  const checkinsRepository = new CheckinsRepository({
    model: CheckinsModel
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
  const gateway = new GetTemporalEvolutionGateway({
    teamRepository,
    objectiveRepository,
    resultKeyRepository,
    checkinsRepository,
    logging: logger
  });

  const presenter = new Presenter();

  const interactor = new GetTemporalEvolutionInteractor({
    gateway,
    presenter,
    userCompanyValidator
  });

  const controller = new GetTemporalEvolutionController({
    interactor
  });

  return {
    controller,
    interactor,
    gateway
  };
}
