import { Presenter } from '@protocols/presenter';
import { UserCompanyValidationInteractor } from '@domains/common';
import { UserCompanyValidationGateway } from '@domains/common/validations/gateways/user.company.validation.gateway';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { TeamRepository } from '@domains/api/teams/repository/team.repository';
import { ObjectiveRepository } from '@domains/api/objectives/repository/objective.repository';
import { ResultKeyRepository } from '@domains/api/results-keys/repository/result-key.repository';
import { ResultKeyUpdateRepository } from '@domains/api/checkins/repository/result-key-update.repository';
import { ProfileRepository } from '@domains/api/profile/repository/profile.repository';
import UserModel from '@domains/api/users/model/user.model';
import TeamModel from '@domains/api/teams/model/team.model';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';
import ResultKeyModel from '@domains/api/results-keys/model/result-key.model';
import ProfileModel from '@domains/api/profile/model/profile.model';
import { logger } from '@configs/logger';

import { GetTopContributorsGateway } from '../gateways/get.top.contributors.gateway';
import { GetTopContributorsInteractor } from '../usecases/get.top.contributors.interactor';
import { GetTopContributorsController } from '../controllers/get.top.contributors.controller';
import ResultKeyUpdateModel from '@domains/api/checkins/model/result-key-update.model';

export function getTopContributorsFactory() {
  // Repositories
  const userRepository = new UserRepository({ model: UserModel });
  const teamRepository = new TeamRepository({ model: TeamModel });
  const objectiveRepository = new ObjectiveRepository({
    model: ObjectiveModel
  });
  const resultKeyRepository = new ResultKeyRepository({
    model: ResultKeyModel
  });
  const resultKeyUpdateRepository = new ResultKeyUpdateRepository({
    model: ResultKeyUpdateModel
  });
  const profileRepository = new ProfileRepository({
    model: ProfileModel
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
  const gateway = new GetTopContributorsGateway({
    teamRepository,
    objectiveRepository,
    resultKeyRepository,
    resultKeyUpdateRepository,
    userRepository,
    profileRepository,
    logging: logger
  });

  const presenter = new Presenter();

  const interactor = new GetTopContributorsInteractor({
    gateway,
    presenter,
    userCompanyValidator
  });

  const controller = new GetTopContributorsController({
    interactor
  });

  return {
    controller,
    interactor,
    gateway
  };
}
