import { logger } from '@configs/logger';
import UserModel from '@domains/api/users/model/user.model';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { makeUserCompanyValidationInteractor } from '@domains/common/validations/factories';
import { Presenter } from '@protocols/presenter';
import { UpdatePlannerController } from '../controllers/';
import { UpdatePlannerGateway } from '../gateways/update.planner.gateway';
import PlannerModel from '../model/planner.model';
import { PlannerRepository } from '../repository/planner.repository';
import { UpdatePlannerInteractor } from '../usecases';

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

const updatePlannerGateway = new UpdatePlannerGateway(params);
const interactor = new UpdatePlannerInteractor({
  gateway: updatePlannerGateway,
  presenter: new Presenter(),
  userCompanyValidator: makeUserCompanyValidationInteractor()
});

export const updatePlannerController = new UpdatePlannerController({
  interactor
});
