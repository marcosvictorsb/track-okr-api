import { logger } from '@configs/logger';
import { GetAnnualPlanningGateway } from '../gateways/get.annual.planning.gateway';
import { GetAnnualPlanningInteractor } from '../usecases/get.annual.planning.interactor';
import { GetAnnualPlanningController } from '../controllers/get.annual.planning.controller';
import { Presenter } from '@protocols/presenter';
import { makeUserCompanyValidationInteractor } from '@domains/common/validations/factories';
import { PlannerRepository } from '@domains/api/planners/repository/planner.repository';
import { ObjectiveRepository } from '@domains/api/objectives/repository/objective.repository';
import { ResultKeyRepository } from '@domains/api/results-keys/repository/result-key.repository';
import PlannerModel from '@domains/api/planners/model/planner.model';
import ObjectiveModel from '@domains/api/objectives/model/objective.model';
import ResultKeyModel from '@domains/api/results-keys/model/result-key.model';

const plannerRepository = new PlannerRepository({
  model: PlannerModel
});

const objectiveRepository = new ObjectiveRepository({
  model: ObjectiveModel
});

const resultKeyRepository = new ResultKeyRepository({
  model: ResultKeyModel
});

const gatewayParams = {
  plannerRepository,
  objectiveRepository,
  resultKeyRepository,
  logging: logger
};

const getAnnualPlanningGateway = new GetAnnualPlanningGateway(gatewayParams);

const interactor = new GetAnnualPlanningInteractor({
  gateway: getAnnualPlanningGateway,
  presenter: new Presenter(),
  userCompanyValidator: makeUserCompanyValidationInteractor()
});

export const getAnnualPlanningController = new GetAnnualPlanningController({
  interactor
});
