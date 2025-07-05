import { DeleteObjectiveController } from '@domains/api/objectives/controllers';
import { DeleteObjectiveInteractor } from '@domains/api/objectives/usecases';
import { ObjectiveGateway } from '@domains/api/objectives/gateways';
import { ObjectiveRepository } from '@domains/api/objectives/repository/objective.repository';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';
import { logger } from '@configs/logger';

export const makeDeleteObjectiveController = () => {
  const objectiveRepository = new ObjectiveRepository({
    model: ObjectiveModel
  });
  const params = {
    objectiveRepository,
    logging: logger
  };
  const objectiveGateway = new ObjectiveGateway(params);
  const deleteObjectiveInteractor = new DeleteObjectiveInteractor(
    objectiveGateway
  );
  return new DeleteObjectiveController(deleteObjectiveInteractor);
};
