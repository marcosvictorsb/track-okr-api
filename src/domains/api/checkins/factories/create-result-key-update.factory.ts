import { CreateResultKeyUpdateController } from '../controllers/create-result-key-update.controller';
import { CreateResultKeyUpdateInteractor } from '../usecases/create-result-key-update.interactor';
import { CreateResultKeyUpdateGateway } from '../gateways/create-result-key-update.gateway';
import { ResultKeyRepository } from '../../results-keys/repository/result-key.repository';
import { ResultKeyUpdateRepository } from '../repository/result-key-update.repository';
import { userCompanyValidatiorInteractor } from '@domains/common/validations/factories/user.company.validation.factory';
import { Presenter } from '@protocols/presenter';
import { logger } from '@configs/logger';
import ResultKeyModel from '../../results-keys/model/result-key.model';
import ResultKeyUpdateModel from '../model/result-key-update.model';

export const makeCreateResultKeyUpdateFactory = () => {
  // Repositories
  const resultKeyRepository = new ResultKeyRepository({
    model: ResultKeyModel
  });

  const resultKeyUpdateRepository = new ResultKeyUpdateRepository({
    model: ResultKeyUpdateModel
  });

  // Gateway
  const gateway = new CreateResultKeyUpdateGateway({
    resultKeyRepository,
    resultKeyUpdateRepository,
    logging: logger
  });

  // Presenter
  const presenter = new Presenter();

  // Interactor
  const interactor = new CreateResultKeyUpdateInteractor({
    gateway,
    presenter,
    userCompanyValidator: userCompanyValidatiorInteractor
  });

  // Controller
  const controller = new CreateResultKeyUpdateController({
    interactor
  });

  return controller;
};
