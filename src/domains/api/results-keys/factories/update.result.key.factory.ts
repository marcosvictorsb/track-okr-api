import { logger } from '@configs/logger';
import { UpdateResultKeyGateway } from '../gateway/update.result.key.gateway';
import ResultKeyModel from '../model/result-key.model';
import { ResultKeyRepository } from '../repository';
import { UpdateResultKeyInteractor } from '../usecases/update.result.key.interactor';
import { Presenter } from '@protocols/presenter';
import { makeUserCompanyValidationInteractor } from '@domains/common/validations/factories';
import { UpdateResultKeyController } from '../controllers/update.result.key.controller';

export const makeUpdateResultKeyFactory = () => {
  // Gateway
  const gateway = new UpdateResultKeyGateway({
    resultKeyRepository: new ResultKeyRepository({ model: ResultKeyModel }),
    logging: logger
  });

  // Interactor
  const interactor = new UpdateResultKeyInteractor({
    gateway,
    presenter: new Presenter(),
    userCompanyValidator: makeUserCompanyValidationInteractor()
  });

  // Controller
  return new UpdateResultKeyController({
    interactor
  });
};
