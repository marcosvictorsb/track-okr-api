import { logger } from '@configs/logger';
import { Presenter } from '@protocols/presenter';
import { PlanRepository } from '../repository/plan.repository';
import { PlanModel } from '../models/plan.model';
import { CreatePlanGateway } from '../gateway/create.plan.gateway';
import { CreatePlanInteractor } from '../usecases/create.plan.interactor';
import { CreatePlanController } from '../controllers/create.plans.controller';

const repository = new PlanRepository({ model: PlanModel });
const presenter = new Presenter();

const params = {
  planRepository: repository,
  logging: logger
};

const createGatewayPlan = new CreatePlanGateway(params);
const interactor = new CreatePlanInteractor({
  gateway: createGatewayPlan,
  presenter
});

export const createPlanController = new CreatePlanController({
  interactor: interactor
});
