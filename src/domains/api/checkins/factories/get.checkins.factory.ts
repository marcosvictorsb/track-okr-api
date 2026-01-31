import { logger } from '@configs/logger';
import { Presenter } from '@protocols/presenter';
import { GetCheckinsController } from '../../results-keys/controllers';
import ResultKeyModel from '../../results-keys/model/result-key.model';
import { ResultKeyRepository } from '../../results-keys/repository/result-key.repository';
import { GetCheckinsInteractor } from '../../results-keys/usecases';
import { GetCheckinsGateway } from '../gateways/get.checkins.gateway';
import { IGetCheckinsInteractorDependencies } from '../interfaces';
import CheckinsModel from '../model/checkin.model';
import { CheckinsRepository } from '../repository/checkins.repository';

export function makeGetCheckinsFactory(): GetCheckinsController {
  const resultKeyRepository = new ResultKeyRepository({
    model: ResultKeyModel
  });

  const checkinsRepository = new CheckinsRepository({
    model: CheckinsModel
  });

  const gateway = new GetCheckinsGateway({
    resultKeyRepository,
    checkinsRepository,
    logging: logger
  });

  const params: IGetCheckinsInteractorDependencies = {
    gateway,
    presenter: new Presenter()
  };

  const interactor = new GetCheckinsInteractor(params);

  const controller = new GetCheckinsController(interactor);

  return controller;
}
