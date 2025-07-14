import { GetObjectiveController } from '@domains/api/objectives/controllers';
import { GetObjectiveInteractor } from '@domains/api/objectives/usecases';
import { GetObjectiveGateway } from '@domains/api/objectives/gateways';
import { ObjectiveRepository } from '@domains/api/objectives/repository/objective.repository';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';
import { Presenter } from '@protocols/presenter';
import { userCompanyValidatiorInteractor } from '@domains/common/validations/factories';
import { logger } from '@configs/logger';
import TeamModel from '@domains/api/teams/model/team.model';
import { TeamRepository } from '@domains/api/teams/repository/team.repository';
import { ResultKeyRepository } from '@domains/api/results-keys/repository/result-key.repository';
import ResultKeyModel from '@domains/api/results-keys/model/result-key.model';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import UserModel from '@domains/api/users/model/user.model';
import { ProfileRepository } from '@domains/api/profile/repository/profile.repository';
import { ProfileModel } from '@domains/api/profile/model';

export const makeGetObjectiveController = () => {
  const objectiveRepository = new ObjectiveRepository({
    model: ObjectiveModel
  });

  const teamRepository = new TeamRepository({
    model: TeamModel
  });

  const resultKeyRepository = new ResultKeyRepository({
    model: ResultKeyModel
  });

  const userRepository = new UserRepository({
    model: UserModel
  });

  const profileRepository = new ProfileRepository({
    model: ProfileModel
  });

  const params = {
    objectiveRepository,
    teamRepository,
    resultKeyRepository,
    userRepository,
    profileRepository,
    logging: logger
  };

  const objectiveGateway = new GetObjectiveGateway(params);

  const interactor = new GetObjectiveInteractor({
    gateway: objectiveGateway,
    presenter: new Presenter(),
    userCompanyValidator: userCompanyValidatiorInteractor
  });

  return new GetObjectiveController({
    interactor
  });
};
