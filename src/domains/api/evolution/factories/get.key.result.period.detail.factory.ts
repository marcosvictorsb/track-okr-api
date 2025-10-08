import { logger } from '@configs/logger';
import CheckinsModel from '@domains/api/checkins/model/checkin.model';
import { CheckinsRepository } from '@domains/api/checkins/repository/checkins.repository';
import { GetKeyResultPeriodDetailController } from '@domains/api/evolution/controllers';
import { makeUserCompanyValidationInteractor } from '@domains/common/validations/factories';
import { Presenter } from '@protocols/presenter';
import { GetKeyResultPeriodDetailGateway } from '../gateways/get.key.result.period.detail.gateway';
import { GetKeyResultPeriodDetailInteractor } from '../usecases';

export const makeGetKeyResultPeriodDetailController = () => {
  const params = {
    checkinRepository: new CheckinsRepository({ model: CheckinsModel }),
    logging: logger
  };

  const evolutionGateway = new GetKeyResultPeriodDetailGateway(params);

  const interactor = new GetKeyResultPeriodDetailInteractor({
    gateway: evolutionGateway,
    presenter: new Presenter(),
    userCompanyValidator: makeUserCompanyValidationInteractor()
  });

  return new GetKeyResultPeriodDetailController({
    interactor
  });
};
