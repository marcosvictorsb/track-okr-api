import { GetResultKeyUpdatesGateway } from '../gateways/get-result-key-updates.gateway';
import { GetKeyResultsUpdatesHistoryInteractor } from '../usecases/get-result-key-updates.interactor';
import { GetKeyResultsUpdatesHistoryController } from '../controllers/get-result-key-updates.controller';
import { ResultKeyRepository } from '../repository/result-key.repository';
import { ResultKeyUpdateRepository } from '../repository/result-key-update.repository';
import ResultKeyModel from '../model/result-key.model';
import ResultKeyUpdateModel from '../model/result-key-update.model';
import { logger } from '@configs/logger';
import { Presenter } from '@protocols/presenter';
import { IGetKeyResultsUpdatesHistoryInteractorDependencies } from '../interfaces';

export function makeGetResultKeyUpdatesFactory(): GetKeyResultsUpdatesHistoryController {
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

  const params: IGetKeyResultsUpdatesHistoryInteractorDependencies = {
    gateway,
    presenter: new Presenter()
  };

  // Interactor
  const interactor = new GetKeyResultsUpdatesHistoryInteractor(params);

  // Controller
  const controller = new GetKeyResultsUpdatesHistoryController(interactor);

  return controller;
}
