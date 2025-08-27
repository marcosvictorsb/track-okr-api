import { ObjectiveRepository } from '@domains/api/objectives/repository/objective.repository';
import { makeUserCompanyValidationInteractor } from '@domains/common/validations/factories';
import { UserRepository } from '@domains/api/users/repository/user.repository';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';
import { DeletePlannerGateway } from '../gateways/delete.planner.gateway';
import { PlannerRepository } from '../repository/planner.repository';
import UserModel from '@domains/api/users/model/user.model';
import { DeletePlannerController } from '../controllers/';
import { DeletePlannerInteractor } from '../usecases';
import PlannerModel from '../model/planner.model';
import { Presenter } from '@protocols/presenter';
import { logger } from '@configs/logger';

const params = {
  logging: logger,
  plannerRepository: new PlannerRepository({
    model: PlannerModel
  }),
  objectiveRepository: new ObjectiveRepository({ model: ObjectiveModel }),
  userRepository: new UserRepository({
    model: UserModel
  })
};

const deletePlannerGateway = new DeletePlannerGateway(params);
const interactor = new DeletePlannerInteractor({
  gateway: deletePlannerGateway,
  presenter: new Presenter(),
  userCompanyValidator: makeUserCompanyValidationInteractor()
});

export const deletePlannerController = new DeletePlannerController({
  interactor
});
