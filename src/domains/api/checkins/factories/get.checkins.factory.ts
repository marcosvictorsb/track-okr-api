import { GetCheckinsGateway } from '../gateways/get.checkins.gateway';
import { ResultKeyRepository } from '../../results-keys/repository/result-key.repository';
import { CheckinsRepository } from '../repository/checkins.repository';
import ResultKeyModel from '../../results-keys/model/result-key.model';
import { logger } from '@configs/logger';
import { Presenter } from '@protocols/presenter';
import { GetCheckinsController } from '../../results-keys/controllers';
import { GetCheckinsInteractor } from '../../results-keys/usecases';
import CheckinsModel from '../model/checkin.model';
import { IGetCheckinsInteractorDependencies } from '../interfaces';

export function makeGetCheckinsFactory(): GetCheckinsController {
  // Repositórios
  const resultKeyRepository = new ResultKeyRepository({
    model: ResultKeyModel
  });

  const checkinsRepository = new CheckinsRepository({
    model: CheckinsModel
  });

  // Gateway
  const gateway = new GetCheckinsGateway({
    resultKeyRepository,
    checkinsRepository,
    logging: logger
  });

  const params: IGetCheckinsInteractorDependencies = {
    gateway,
    presenter: new Presenter()
  };

  // Interactor
  const interactor = new GetCheckinsInteractor(params);

  // Controller
  const controller = new GetCheckinsController(interactor);

  return controller;
}
