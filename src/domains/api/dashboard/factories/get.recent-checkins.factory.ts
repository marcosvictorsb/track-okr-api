import { GetRecentCheckInsGateway } from '../gateways/get.recent-checkins.gateway';
import { GetRecentCheckInsInteractor } from '../usecases/get.recent-checkins.interactor';
import { GetRecentCheckInsController } from '../controllers/get.recent-checkins.controller';
import { ObjectiveRepository } from '@domains/api/objectives/repository/objective.repository';
import { ResultKeyRepository } from '@domains/api/results-keys/repository/result-key.repository';
import { ResultKeyUpdateRepository } from '@domains/api/checkins/repository/result-key-update.repository';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { UserCompanyValidationInteractor } from '@domains/common';
import { Presenter } from '@protocols/presenter';
import { UserCompanyValidationGateway } from '@domains/common/validations/gateways/user.company.validation.gateway';
import { logger } from '@configs/logger';

// Models
import ObjectiveModel from '@domains/api/objectives/model/objective.model';
import ResultKeyModel from '@domains/api/results-keys/model/result-key.model';
import UserModel from '@domains/api/users/model/user.model';
import { ProfileRepository } from '@domains/api/profile/repository/profile.repository';
import { ProfileModel } from '@domains/api/profile/model';
import TeamModel from '@domains/api/teams/model/team.model';
import { TeamRepository } from '@domains/api/teams/repository/team.repository';
import UserTeamModel from '@domains/common/user-teams/model/user-team.model';
import { UserTeamRepository } from '@domains/common/user-teams/repository/user-team.repository';
import ResultKeyUpdateModel from '@domains/api/checkins/model/result-key-update.model';

export function getRecentCheckInsFactory() {
  // Repositories
  const objectiveRepository = new ObjectiveRepository({
    model: ObjectiveModel
  });
  const resultKeyRepository = new ResultKeyRepository({
    model: ResultKeyModel
  });
  const resultKeyUpdateRepository = new ResultKeyUpdateRepository({
    model: ResultKeyUpdateModel
  });
  const userRepository = new UserRepository({ model: UserModel });
  const profileRepository = new ProfileRepository({
    model: ProfileModel
  });
  const teamRepository = new TeamRepository({
    model: TeamModel // Assuming a TeamModel exists
  });

  const userTeamRepository = new UserTeamRepository({
    model: UserTeamModel // Assuming a UserTeamModel exists
  });

  // Gateway and Presenter
  const gateway = new GetRecentCheckInsGateway({
    objectiveRepository,
    resultKeyRepository,
    resultKeyUpdateRepository,
    userRepository,
    profileRepository,
    teamRepository,
    userTeamRepository,
    logging: logger
  });
  const presenter = new Presenter();

  // User Company Validation
  const userCompanyValidationGateway = new UserCompanyValidationGateway({
    userRepository,
    logging: logger
  });
  const userCompanyValidator = new UserCompanyValidationInteractor({
    gateway: userCompanyValidationGateway
  });

  // Interactor and Controller
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
