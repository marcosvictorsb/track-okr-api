import { logger } from '@configs/logger';
import { Presenter } from '@protocols/presenter';
import { CreateSupportContactController } from '../controllers';
import { CreateSupportContactGateway } from '../gateways';
import SupportContactModel from '../model/support-contact.model';
import { SupportContactRepository } from '../repository/support-contact.repository';
import { CreateSupportContactInteractor } from '../usecases';

const supportContactRepository = new SupportContactRepository({
  model: SupportContactModel
});

const params = {
  logging: logger,
  supportContactRepository
};

const createSupportContactGateway = new CreateSupportContactGateway(params);

const interactor = new CreateSupportContactInteractor({
  gateway: createSupportContactGateway,
  presenter: new Presenter()
});

export const createSupportContactController =
  new CreateSupportContactController({
    interactor
  });
