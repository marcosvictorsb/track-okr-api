import { logger } from '@configs/logger';
import CheckinsModel from '@domains/api/checkins/model/checkin.model';
import { CheckinsRepository } from '@domains/api/checkins/repository/checkins.repository';
import { GetEvolutionController } from '@domains/api/evolution/controllers';
import { GetEvolutionGateway } from '@domains/api/evolution/gateways';
import { GetEvolutionInteractor } from '@domains/api/evolution/usecases';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';
import { ObjectiveRepository } from '@domains/api/objectives/repository/objective.repository';
import { ProfileModel } from '@domains/api/profile/model';
import { ProfileRepository } from '@domains/api/profile/repository/profile.repository';
import ResultKeyModel from '@domains/api/results-keys/model/result-key.model';
import { ResultKeyRepository } from '@domains/api/results-keys/repository/result-key.repository';
import TeamModel from '@domains/api/teams/model/team.model';
import { TeamRepository } from '@domains/api/teams/repository/team.repository';
import UserModel from '@domains/api/users/model/user.model';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { makeUserCompanyValidationInteractor } from '@domains/common/validations/factories';
import { Presenter } from '@protocols/presenter';

export const makeGetEvolutionController = () => {
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

  const checkInRepository = new CheckinsRepository({
    model: CheckinsModel
  });

  const params = {
    objectiveRepository,
    teamRepository,
    resultKeyRepository,
    userRepository,
    profileRepository,
    checkInRepository,
    logging: logger
  };

  const evolutionGateway = new GetEvolutionGateway(params);

  const interactor = new GetEvolutionInteractor({
    gateway: evolutionGateway,
    presenter: new Presenter(),
    userCompanyValidator: makeUserCompanyValidationInteractor()
  });

  return new GetEvolutionController({
    interactor
  });
};
