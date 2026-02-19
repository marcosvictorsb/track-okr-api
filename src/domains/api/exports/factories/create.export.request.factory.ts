import { logger } from '@configs/logger';
import UserModel from '@domains/api/users/model/user.model';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { Presenter } from '@protocols/presenter';
import { CreateExportRequestController } from '../controllers/create.export.request.controller';
import { CreateExportRequestGateway } from '../gateways/create.export.request.gateway';
import ExportRequestModel from '../model/export.request.model';
import { ExportRequestRepository } from '../repository/export.request.repository';
import { CreateExportRequestInteractor } from '../usecases/create.export.request.interactor';

export const makeCreateExportRequestController =
  (): CreateExportRequestController => {
    const exportRequestRepository = new ExportRequestRepository({
      model: ExportRequestModel
    });

    const userRepository = new UserRepository({
      model: UserModel
    });

    const presenter = new Presenter();

    const gateway = new CreateExportRequestGateway({
      exportRequestRepository,
      userRepository,
      logging: logger
    });

    const interactor = new CreateExportRequestInteractor({
      gateway,
      presenter
    });

    return new CreateExportRequestController({ interactor });
  };
