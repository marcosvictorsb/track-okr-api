import { logger } from '@configs/logger';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';
import { ObjectiveRepository } from '@domains/api/objectives/repository/objective.repository';
import TeamModel from '@domains/api/teams/model/team.model';
import { TeamRepository } from '@domains/api/teams/repository/team.repository';
import { makeCheckCompanyFeatureLimitsInteractor } from '@domains/common/validations/factories/check.company.feature.limits.factories';
import { makeUserCompanyValidationInteractor } from '@domains/common/validations/factories/user.company.validation.factory';
import { Presenter } from '@protocols/presenter';
import { CreateResultKeyController } from '../controllers/create.result-key.controller';
import { CreateResultKeyGateway } from '../gateways/create.result-key.gateway';
import ResultKeyModel from '../model/result-key.model';
import { ResultKeyRepository } from '../repository/result-key.repository';
import { CreateResultKeyInteractor } from '../usecases/create.result-key.interactor';

export const makeCreateResultKeyFactory = () => {
  const resultKeyRepository = new ResultKeyRepository({
    model: ResultKeyModel
  });
  const teamRepository = new TeamRepository({ model: TeamModel });
  const objectiveRepository = new ObjectiveRepository({
    model: ObjectiveModel
  });

  const gateway = new CreateResultKeyGateway({
    resultKeyRepository,
    teamRepository,
    objectiveRepository,
    logging: logger
  });

  const presenter = new Presenter();

  const interactor = new CreateResultKeyInteractor({
    gateway,
    presenter,
    userCompanyValidator: makeUserCompanyValidationInteractor(),
    checkCompanyFeatureLimits: makeCheckCompanyFeatureLimitsInteractor()
  });

  return new CreateResultKeyController({
    interactor
  });
};
