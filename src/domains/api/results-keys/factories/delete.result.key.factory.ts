import { logger } from '@configs/logger';
import { makeUserCompanyValidationInteractor } from '@domains/common/validations/factories';
import { Presenter } from '@protocols/presenter';
import { DeleteResultKeyController } from '../controllers';
import { DeleteResultKeyGateway } from '../gateways';
import ResultKeyModel from '../model/result-key.model';
import { ResultKeyRepository } from '../repository';
import { DeleteResultKeyInteractor } from '../usecases/delete.result.key.interactor';

export const makeDeleteResultKeyFactory = () => {
  const gateway = new DeleteResultKeyGateway({
    resultKeyRepository: new ResultKeyRepository({ model: ResultKeyModel }),
    logging: logger
  });

  const interactor = new DeleteResultKeyInteractor({
    gateway,
    presenter: new Presenter(),
    userCompanyValidator: makeUserCompanyValidationInteractor()
  });

  return new DeleteResultKeyController({
    interactor
  });
};
