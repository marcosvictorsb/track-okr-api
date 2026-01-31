import { logger } from '@configs/logger';
import UserModel from '@domains/api/users/model/user.model';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { makeUserCompanyValidationInteractor } from '@domains/common/validations/factories';
import { makeCheckCompanyFeatureLimitsInteractor } from '@domains/common/validations/factories/check.company.feature.limits.factories';
import { Presenter } from '@protocols/presenter';
import { CreatePlannerController } from '../controllers/';
import { CreatePlannerGateway } from '../gateways/create.planner.gateway';
import PlannerModel from '../model/planner.model';
import { PlannerRepository } from '../repository/planner.repository';
import { CreatePlannerInteractor } from '../usecases';

const plannerRepository = new PlannerRepository({
  model: PlannerModel
});

const userRepository = new UserRepository({
  model: UserModel
});

const params = {
  logging: logger,
  plannerRepository,
  userRepository
};
const createPlannerGateway = new CreatePlannerGateway(params);
const interactor = new CreatePlannerInteractor({
  gateway: createPlannerGateway,
  presenter: new Presenter(),
  userCompanyValidator: makeUserCompanyValidationInteractor(),
  checkCompanyFeatureLimits: makeCheckCompanyFeatureLimitsInteractor()
});

export const createPlannerController = new CreatePlannerController({
  interactor
});
