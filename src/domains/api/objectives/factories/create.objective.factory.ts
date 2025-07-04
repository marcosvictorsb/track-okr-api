import { CreateObjectiveController } from '@domains/api/objectives/controllers';
import { CreateObjectiveInteractor } from '@domains/api/objectives/usecases';
import { ObjectiveGateway } from '@domains/api/objectives/gateways';
import { ObjectiveRepository } from '@domains/api/objectives/repository/objective.repository';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';

const objectiveRepository = new ObjectiveRepository({ model: ObjectiveModel });
const objectiveGateway = new ObjectiveGateway(objectiveRepository);
const createObjectiveInteractor = new CreateObjectiveInteractor(objectiveGateway);
export const createObjectiveController = new CreateObjectiveController(createObjectiveInteractor);
