import { logger } from '@configs/logger';
import { makeUserCompanyValidationInteractor } from '@domains/common/validations/factories/user.company.validation.factory';
import { Presenter } from '@protocols/presenter';
import ResultKeyModel from '../../results-keys/model/result-key.model';
import { ResultKeyRepository } from '../../results-keys/repository/result-key.repository';
import { CreateCheckinsController } from '../controllers/create.checkins.controller';
import { CreateCheckinsGateway } from '../gateways/create.checkins.gateway';
import CheckinsModel from '../model/checkin.model';
import { CheckinsRepository } from '../repository/checkins.repository';
import { CreateCheckinsInteractor } from '../usecases/create.checkins.interactor';

export const makeCreateCheckinsFactory = () => {
  const resultKeyRepository = new ResultKeyRepository({
    model: ResultKeyModel
  });

  const checkinsRepository = new CheckinsRepository({
    model: CheckinsModel
  });

  const gateway = new CreateCheckinsGateway({
    resultKeyRepository,
    checkinsRepository,
    logging: logger
  });

  const presenter = new Presenter();

  const interactor = new CreateCheckinsInteractor({
    gateway,
    presenter,
    userCompanyValidator: makeUserCompanyValidationInteractor()
  });

  const controller = new CreateCheckinsController({
    interactor
  });

  return controller;
};
