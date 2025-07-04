import { GetObjectiveController } from '@domains/api/objectives/controllers';
import { GetObjectiveInteractor } from '@domains/api/objectives/usecases';
import { ObjectiveGateway } from '@domains/api/objectives/gateways';
import { ObjectiveRepository } from '@domains/api/objectives/repository/objective.repository';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';

const objectiveRepository = new ObjectiveRepository({ model: ObjectiveModel });
const objectiveGateway = new ObjectiveGateway(objectiveRepository);
const getObjectiveInteractor = new GetObjectiveInteractor(objectiveGateway);
export const getObjectiveController = new GetObjectiveController(
  getObjectiveInteractor
);
