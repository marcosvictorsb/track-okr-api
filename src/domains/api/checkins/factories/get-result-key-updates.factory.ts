import { GetResultKeyUpdatesGateway } from '../gateways/get-result-key-updates.gateway';
import { ResultKeyRepository } from '../../results-keys/repository/result-key.repository';
import { ResultKeyUpdateRepository } from '../repository/result-key-update.repository';
import ResultKeyModel from '../../results-keys/model/result-key.model';
import { logger } from '@configs/logger';
import { Presenter } from '@protocols/presenter';
import { GetKeyResultUpdateController } from '../../results-keys/controllers';
import { GetKeyResultUpdateInteractor } from '../../results-keys/usecases';
import ResultKeyUpdateModel from '../model/result-key-update.model';
import { IGetKeyResultUpdateInteractorDependencies } from '../interfaces';

export function makeGetResultKeyUpdatesFactory(): GetKeyResultUpdateController {
  // Repositórios
  const resultKeyRepository = new ResultKeyRepository({
    model: ResultKeyModel
  });

  const resultKeyUpdateRepository = new ResultKeyUpdateRepository({
    model: ResultKeyUpdateModel
  });

  // Gateway
  const gateway = new GetResultKeyUpdatesGateway({
    resultKeyRepository,
    resultKeyUpdateRepository,
    logging: logger
  });

  const params: IGetKeyResultUpdateInteractorDependencies = {
    gateway,
    presenter: new Presenter()
  };

  // Interactor
  const interactor = new GetKeyResultUpdateInteractor(params);

  // Controller
  const controller = new GetKeyResultUpdateController(interactor);

  return controller;
}
