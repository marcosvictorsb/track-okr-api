import { UpdateObjectiveController } from '@domains/api/objectives/controllers';
import { UpdateObjectiveInteractor } from '@domains/api/objectives/usecases';
import { ObjectiveGateway } from '@domains/api/objectives/gateways';
import { ObjectiveRepository } from '@domains/api/objectives/repository/objective.repository';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';
import { logger } from '@configs/logger';
import { TeamRepository } from '@domains/api/teams/repository/team.repository';
import TeamModel from '@domains/api/teams/model/team.model';

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
  const objectiveGateway = new ObjectiveGateway(params);
  const updateObjectiveInteractor = new UpdateObjectiveInteractor(
    objectiveGateway
  );
  return new UpdateObjectiveController(updateObjectiveInteractor);
};
