import { logger } from '@configs/logger';
import CheckinModel from '@domains/api/checkins/model/checkin.model';
import { CheckinsRepository } from '@domains/api/checkins/repository';
import { DeleteObjectiveController } from '@domains/api/objectives/controllers';
import { DeleteObjectiveGateway } from '@domains/api/objectives/gateways';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';
import { ObjectiveRepository } from '@domains/api/objectives/repository/objective.repository';
import { DeleteObjectiveInteractor } from '@domains/api/objectives/usecases';
import { ResultKeyRepository } from '@domains/api/results-keys';
import ResultKeyModel from '@domains/api/results-keys/model/result-key.model';
import { makeUserCompanyValidationInteractor } from '@domains/common/validations/factories';
import { Presenter } from '@protocols/presenter';
import { IDeleteObjectiveGatewayDependencies } from '../interfaces';

export const makeDeleteObjectiveController = () => {
  const params: IDeleteObjectiveGatewayDependencies = {
    objectiveRepository: new ObjectiveRepository({ model: ObjectiveModel }),
    resultKeyRepository: new ResultKeyRepository({ model: ResultKeyModel }),
    checkinsRepository: new CheckinsRepository({ model: CheckinModel }),
    logging: logger
  };
  const gateway = new DeleteObjectiveGateway(params);
  const presenter = new Presenter();
  const userCompanyValidator = makeUserCompanyValidationInteractor();
  const deleteObjectiveInteractor = new DeleteObjectiveInteractor({
    gateway,
    presenter,
    userCompanyValidator
  });
  return new DeleteObjectiveController(deleteObjectiveInteractor);
};
