import { GetObjectiveController } from '@domains/api/objectives/controllers';
import { GetObjectiveInteractor } from '@domains/api/objectives/usecases';
import { ObjectiveGateway } from '@domains/api/objectives/gateways';
import { ObjectiveRepository } from '@domains/api/objectives/repository/objective.repository';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';
import { logger } from '@configs/logger';

export const makeGetObjectiveController = () => {
  const objectiveRepository = new ObjectiveRepository({
    model: ObjectiveModel
  });
  const params = {
    objectiveRepository,
    logging: logger
  };
  const objectiveGateway = new ObjectiveGateway(params);
  const getObjectiveInteractor = new GetObjectiveInteractor(objectiveGateway);
  return new GetObjectiveController(getObjectiveInteractor);
};
