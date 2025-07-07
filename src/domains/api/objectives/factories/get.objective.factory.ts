import { GetObjectiveController } from '@domains/api/objectives/controllers';
import { GetObjectiveInteractor } from '@domains/api/objectives/usecases';
import { ObjectiveGateway } from '@domains/api/objectives/gateways';
import { ObjectiveRepository } from '@domains/api/objectives/repository/objective.repository';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';
import { Presenter } from '@protocols/presenter';
import { userCompanyValidatiorInteractor } from '@domains/common/validations/factories';
import { logger } from '@configs/logger';
import TeamModel from '@domains/api/teams/model/team.model';
import { TeamRepository } from '@domains/api/teams/repository/team.repository';

export const makeGetObjectiveController = () => {
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

  const objectiveGateway = new ObjectiveGateway(params);

  const interactor = new GetObjectiveInteractor({
    gateway: objectiveGateway,
    presenter: new Presenter(),
    userCompanyValidator: userCompanyValidatiorInteractor
  });

  return new GetObjectiveController({
    interactor
  });
};
