import { GetCompanyPermissionsController } from '../controllers/get.company.permissions.controller';
import { GetCompanyPermissionsInteractor } from '../usecases/get.company.permissions.interactor';
import { GetCompanyPermissionsGateway } from '../gateways/get.company.permissions.gateway';
import { userCompanyValidatiorInteractor } from '@domains/common/validations/factories/user.company.validation.factory';
import { makeCheckCompanyFeatureLimitsInteractor } from '@domains/common/validations/factories/check.company.feature.limits.factories';
import { Presenter } from '@protocols/presenter';
import { logger } from '@configs/logger';

export const makeGetCompanyPermissionsController = () => {
  // Gateway
  const gateway = new GetCompanyPermissionsGateway({
    logging: logger
  });

  // User company validator
  const userCompanyValidator = userCompanyValidatiorInteractor;

  // Check company feature limits
  const checkCompanyFeatureLimits = makeCheckCompanyFeatureLimitsInteractor();

  // Presenter
  const presenter = new Presenter();

  // Interactor
  const interactor = new GetCompanyPermissionsInteractor({
    gateway,
    presenter,
    userCompanyValidator,
    checkCompanyFeatureLimits
  });

  // Controller
  return new GetCompanyPermissionsController({
    interactor
  });
};
