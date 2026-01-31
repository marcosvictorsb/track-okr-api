import { logger } from '@configs/logger';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';
import { ObjectiveRepository } from '@domains/api/objectives/repository/objective.repository';
import ResultKeyModel from '@domains/api/results-keys/model/result-key.model';
import { ResultKeyRepository } from '@domains/api/results-keys/repository/result-key.repository';
import TeamModel from '@domains/api/teams/model/team.model';
import { TeamRepository } from '@domains/api/teams/repository/team.repository';
import UserModel from '@domains/api/users/model/user.model';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { UserCompanyValidationInteractor } from '@domains/common';
import { UserCompanyValidationGateway } from '@domains/common/validations/gateways/user.company.validation.gateway';
import { Presenter } from '@protocols/presenter';
import { GetOverviewController } from '../controllers/get.overview.controller';
import { GetOverviewGateway } from '../gateways';
import { GetOverviewInteractor } from '../usecases/get.overview.interactor';

export const makeGetOverviewController = (): GetOverviewController => {
  const presenter = new Presenter();

  const userRepository = new UserRepository({ model: UserModel });
  const teamRepository = new TeamRepository({ model: TeamModel });
  const objectiveRepository = new ObjectiveRepository({
    model: ObjectiveModel
  });
  const resultKeyRepository = new ResultKeyRepository({
    model: ResultKeyModel
  });

  const validationGateway = new UserCompanyValidationGateway({
    userRepository,
    logging: logger
  });

  const userCompanyValidator = new UserCompanyValidationInteractor({
    gateway: validationGateway
  });

  const gateway = new GetOverviewGateway({
    teamRepository,
    objectiveRepository,
    resultKeyRepository,
    logging: logger
  });

  const interactor = new GetOverviewInteractor({
    gateway,
    presenter,
    userCompanyValidator
  });

  return new GetOverviewController({
    interactor
  });
};
