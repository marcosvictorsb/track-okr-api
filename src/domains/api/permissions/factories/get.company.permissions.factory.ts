import { logger } from '@configs/logger';
import { makeCheckCompanyFeatureLimitsInteractor } from '@domains/common/validations/factories/check.company.feature.limits.factories';
import { makeUserCompanyValidationInteractor } from '@domains/common/validations/factories/user.company.validation.factory';
import { Presenter } from '@protocols/presenter';
import { GetCompanyPermissionsController } from '../controllers/get.company.permissions.controller';
import { GetCompanyPermissionsGateway } from '../gateways/get.company.permissions.gateway';
import { GetCompanyPermissionsInteractor } from '../usecases/get.company.permissions.interactor';

export const makeGetCompanyPermissionsController = () => {
  const gateway = new GetCompanyPermissionsGateway({
    logging: logger
  });

  const checkCompanyFeatureLimits = makeCheckCompanyFeatureLimitsInteractor();

  const presenter = new Presenter();

  const interactor = new GetCompanyPermissionsInteractor({
    gateway,
    presenter,
    userCompanyValidator: makeUserCompanyValidationInteractor(),
    checkCompanyFeatureLimits
  });

  return new GetCompanyPermissionsController({
    interactor
  });
};
