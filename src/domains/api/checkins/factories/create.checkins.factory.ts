import { CreateCheckinsController } from '../controllers/create.checkins.controller';
import { CreateCheckinsInteractor } from '../usecases/create.checkins.interactor';
import { CreateCheckinsGateway } from '../gateways/create.checkins.gateway';
import { ResultKeyRepository } from '../../results-keys/repository/result-key.repository';
import { CheckinsRepository } from '../repository/checkins.repository';
import { makeUserCompanyValidatiorInteractor } from '@domains/common/validations/factories/user.company.validation.factory';
import { Presenter } from '@protocols/presenter';
import { logger } from '@configs/logger';
import ResultKeyModel from '../../results-keys/model/result-key.model';
import CheckinsModel from '../model/checkin.model';

export const makeCreateCheckinsFactory = () => {
  // Repositories
  const resultKeyRepository = new ResultKeyRepository({
    model: ResultKeyModel
  });

  const checkinsRepository = new CheckinsRepository({
    model: CheckinsModel
  });

  // Gateway
  const gateway = new CreateCheckinsGateway({
    resultKeyRepository,
    checkinsRepository,
    logging: logger
  });

  // Presenter
  const presenter = new Presenter();

  // Interactor
  const interactor = new CreateCheckinsInteractor({
    gateway,
    presenter,
    userCompanyValidator: makeUserCompanyValidatiorInteractor()
  });

  // Controller
  const controller = new CreateCheckinsController({
    interactor
  });

  return controller;
};
