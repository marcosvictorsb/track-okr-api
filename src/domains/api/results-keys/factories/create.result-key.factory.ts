import { CreateResultKeyController } from '../controllers/create.result-key.controller';
import { CreateResultKeyInteractor } from '../usecases/create.result-key.interactor';
import { CreateResultKeyGateway } from '../gateways/create.result-key.gateway';
import { ResultKeyRepository } from '../repository/result-key.repository';
import { TeamRepository } from '@domains/api/teams/repository/team.repository';
import { ObjectiveRepository } from '@domains/api/objectives/repository/objective.repository';
import { userCompanyValidatiorInteractor } from '@domains/common/validations/factories/user.company.validation.factory';
import { Presenter } from '@protocols/presenter';
import { logger } from '@configs/logger';
import ResultKeyModel from '../model/result-key.model';
import TeamModel from '@domains/api/teams/model/team.model';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';

export const makeCreateResultKeyFactory = () => {
  // Repositories
  const resultKeyRepository = new ResultKeyRepository({
    model: ResultKeyModel
  });
  const teamRepository = new TeamRepository({ model: TeamModel });
  const objectiveRepository = new ObjectiveRepository({
    model: ObjectiveModel
  });

  // Gateway
  const gateway = new CreateResultKeyGateway({
    resultKeyRepository,
    teamRepository,
    objectiveRepository,
    logging: logger
  });

  // User company validator
  const userCompanyValidator = userCompanyValidatiorInteractor;

  // Presenter
  const presenter = new Presenter();

  // Interactor
  const interactor = new CreateResultKeyInteractor({
    gateway,
    presenter,
    userCompanyValidator
  });

  // Controller
  return new CreateResultKeyController({
    interactor
  });
};
