import { logger } from '@configs/logger';
import { DeletePlannerGateway } from '../gateways/delete.planner.gateway';
import PlannerModel from '../model/planner.model';
import UserModel from '@domains/api/users/model/user.model';
import { PlannerRepository } from '../repository/planner.repository';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { DeletePlannerInteractor } from '../usecases';
import { Presenter } from '@protocols/presenter';
import { DeletePlannerController } from '../controllers/';
import { makeUserCompanyValidatiorInteractor } from '@domains/common/validations/factories';

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

const deletePlannerGateway = new DeletePlannerGateway(params);
const interactor = new DeletePlannerInteractor({
  gateway: deletePlannerGateway,
  presenter: new Presenter(),
  userCompanyValidator: makeUserCompanyValidatiorInteractor()
});

export const deletePlannerController = new DeletePlannerController({
  interactor
});
