import { logger } from '@configs/logger';
import { CheckinsRepository } from '@domains/api/checkins/repository/checkins.repository';
import { ObjectiveRepository } from '@domains/api/objectives/repository/objective.repository';
import { ResultKeyRepository } from '@domains/api/results-keys/repository/result-key.repository';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { UserCompanyValidationInteractor } from '@domains/common';
import { UserCompanyValidationGateway } from '@domains/common/validations/gateways/user.company.validation.gateway';
import { Presenter } from '@protocols/presenter';
import { GetRecentCheckInsController } from '../controllers/get.recent-checkins.controller';
import { GetRecentCheckInsGateway } from '../gateways/get.recent-checkins.gateway';
import { GetRecentCheckInsInteractor } from '../usecases/get.recent-checkins.interactor';

// Models
import CheckinsModel from '@domains/api/checkins/model/checkin.model';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';
import { ProfileModel } from '@domains/api/profile/model';
import { ProfileRepository } from '@domains/api/profile/repository/profile.repository';
import ResultKeyModel from '@domains/api/results-keys/model/result-key.model';
import TeamModel from '@domains/api/teams/model/team.model';
import { TeamRepository } from '@domains/api/teams/repository/team.repository';
import UserModel from '@domains/api/users/model/user.model';
import UserTeamModel from '@domains/common/user-teams/model/user-team.model';
import { UserTeamRepository } from '@domains/common/user-teams/repository/user-team.repository';

export function getRecentCheckInsFactory() {
  const objectiveRepository = new ObjectiveRepository({
    model: ObjectiveModel
  });
  const resultKeyRepository = new ResultKeyRepository({
    model: ResultKeyModel
  });
  const checkinsRepository = new CheckinsRepository({
    model: CheckinsModel
  });
  const userRepository = new UserRepository({ model: UserModel });
  const profileRepository = new ProfileRepository({
    model: ProfileModel
  });
  const teamRepository = new TeamRepository({
    model: TeamModel
  });

  const userTeamRepository = new UserTeamRepository({
    model: UserTeamModel
  });

  const gateway = new GetRecentCheckInsGateway({
    objectiveRepository,
    resultKeyRepository,
    checkinsRepository,
    userRepository,
    profileRepository,
    teamRepository,
    userTeamRepository,
    logging: logger
  });
  const presenter = new Presenter();

  const userCompanyValidationGateway = new UserCompanyValidationGateway({
    userRepository,
    logging: logger
  });
  const userCompanyValidator = new UserCompanyValidationInteractor({
    gateway: userCompanyValidationGateway
  });

  const interactor = new GetRecentCheckInsInteractor({
    gateway,
    presenter,
    userCompanyValidator
  });
  const controller = new GetRecentCheckInsController({ interactor });

  return {
    gateway,
    interactor,
    controller,
    presenter
  };
}
