import { logger } from '@configs/logger';
import { makeUserCompanyValidationInteractor } from '@domains/common/validations/factories';
import { Presenter } from '@protocols/presenter';
import { UpdateResultKeyController } from '../controllers/update.result.key.controller';
import { UpdateResultKeyGateway } from '../gateway/update.result.key.gateway';
import ResultKeyModel from '../model/result-key.model';
import { ResultKeyRepository } from '../repository';
import { UpdateResultKeyInteractor } from '../usecases/update.result.key.interactor';

export const makeUpdateResultKeyFactory = () => {
  const gateway = new UpdateResultKeyGateway({
    resultKeyRepository: new ResultKeyRepository({ model: ResultKeyModel }),
    logging: logger
  });

  const interactor = new UpdateResultKeyInteractor({
    gateway,
    presenter: new Presenter(),
    userCompanyValidator: makeUserCompanyValidationInteractor()
  });

  return new UpdateResultKeyController({
    interactor
  });
};
