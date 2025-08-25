import { UpdateObjectiveController } from '@domains/api/objectives/controllers';
import { UpdateObjectiveInteractor } from '@domains/api/objectives/usecases';
import { UpdateObjectiveGateway } from '@domains/api/objectives/gateways';
import { ObjectiveRepository } from '@domains/api/objectives/repository/objective.repository';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';
import { logger } from '@configs/logger';
import { TeamRepository } from '@domains/api/teams/repository/team.repository';
import TeamModel from '@domains/api/teams/model/team.model';
import { Presenter } from '@protocols/presenter';
import {
  makeCheckCompanyFeatureLimitsInteractor,
  makeUserCompanyValidationInteractor
} from '@domains/common/validations/factories';

export const makeUpdateObjectiveController = () => {
  const objectiveRepository = new ObjectiveRepository({
    model: ObjectiveModel
  });
  const teamRepository = new TeamRepository({
    model: TeamModel
  });

  const params = {
    objectiveRepository,
    teamRepository,
    logging: logger
  };
  const objectiveGateway = new UpdateObjectiveGateway(params);
  const updateObjectiveInteractor = new UpdateObjectiveInteractor({
    gateway: objectiveGateway,
    presenter: new Presenter(),
    userCompanyValidator: makeUserCompanyValidationInteractor(),
    checkCompanyFeatureLimitsInteractor:
      makeCheckCompanyFeatureLimitsInteractor()
  });
  return new UpdateObjectiveController({
    interactor: updateObjectiveInteractor
  });
};
