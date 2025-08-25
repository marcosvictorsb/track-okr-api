import { logger } from '@configs/logger';
import { DeleteResultKeyGateway } from '../gateways';
import ResultKeyModel from '../model/result-key.model';
import { ResultKeyRepository } from '../repository';
import { DeleteResultKeyInteractor } from '../usecases/delete.result.key.interactor';
import { Presenter } from '@protocols/presenter';
import { makeUserCompanyValidationInteractor } from '@domains/common/validations/factories';
import { DeleteResultKeyController } from '../controllers';

export const makeDeleteResultKeyFactory = () => {
  // Gateway
  const gateway = new DeleteResultKeyGateway({
    resultKeyRepository: new ResultKeyRepository({ model: ResultKeyModel }),
    logging: logger
  });

  // Interactor
  const interactor = new DeleteResultKeyInteractor({
    gateway,
    presenter: new Presenter(),
    userCompanyValidator: makeUserCompanyValidationInteractor()
  });

  // Controller
  return new DeleteResultKeyController({
    interactor
  });
};
