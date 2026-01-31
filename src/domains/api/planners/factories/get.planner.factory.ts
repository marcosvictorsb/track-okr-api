import { logger } from '@configs/logger';
import UserModel from '@domains/api/users/model/user.model';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import { Presenter } from '@protocols/presenter';
import { GetPlannerController } from '../controllers';
import { GetPlannerGateway } from '../gateways/';
import PlannerModel from '../model/planner.model';
import { PlannerRepository } from '../repository/planner.repository';
import { GetPlannerInteractor } from '../usecases';

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
const getPlannerGateway = new GetPlannerGateway(params);
const interactor = new GetPlannerInteractor({
  gateway: getPlannerGateway,
  presenter: new Presenter()
});

export const getPlannerController = new GetPlannerController({ interactor });
