import { CreateObjectiveController } from '@domains/api/objectives/controllers';
import { CreateObjectiveInteractor } from '@domains/api/objectives/usecases';
import { ObjectiveGateway } from '@domains/api/objectives/gateways';
import { ObjectiveRepository } from '@domains/api/objectives/repository/objective.repository';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';
import { Presenter } from '@protocols/presenter';
import { userCompanyValidatiorInteractor } from '@domains/common/validations/factories';
import { logger } from '@configs/logger';

export const makeCreateObjectiveController = () => {
  const objectiveRepository = new ObjectiveRepository({
    model: ObjectiveModel
  });

  const params = {
    objectiveRepository,
    logging: logger
  };

  const objectiveGateway = new ObjectiveGateway(params);

  const interactor = new CreateObjectiveInteractor({
    gateway: objectiveGateway,
    presenter: new Presenter(),
    userCompanyValidator: userCompanyValidatiorInteractor
  });

  return new CreateObjectiveController({
    interactor
  });
};
