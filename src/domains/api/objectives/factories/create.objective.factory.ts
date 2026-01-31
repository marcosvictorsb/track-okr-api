import { logger } from '@configs/logger';
import { CreateObjectiveController } from '@domains/api/objectives/controllers';
import { CreateObjectiveGateway } from '@domains/api/objectives/gateways';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';
import { ObjectiveRepository } from '@domains/api/objectives/repository/objective.repository';
import { CreateObjectiveInteractor } from '@domains/api/objectives/usecases';
import TeamModel from '@domains/api/teams/model/team.model';
import { TeamRepository } from '@domains/api/teams/repository/team.repository';
import { makeUserCompanyValidationInteractor } from '@domains/common/validations/factories';
import { makeCheckCompanyFeatureLimitsInteractor } from '@domains/common/validations/factories/check.company.feature.limits.factories';
import { Presenter } from '@protocols/presenter';

export const makeCreateObjectiveController = () => {
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

  const objectiveGateway = new CreateObjectiveGateway(params);

  const interactor = new CreateObjectiveInteractor({
    gateway: objectiveGateway,
    presenter: new Presenter(),
    userCompanyValidator: makeUserCompanyValidationInteractor(),
    checkCompanyFeatureLimitsInteractor:
      makeCheckCompanyFeatureLimitsInteractor()
  });

  return new CreateObjectiveController({
    interactor
  });
};
