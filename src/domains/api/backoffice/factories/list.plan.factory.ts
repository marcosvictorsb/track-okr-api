import { logger } from '@configs/logger';
import { Presenter } from '@protocols/presenter';
import { PlanRepository } from '../repository/plan.repository';
import { PlanModel } from '../models/plan.model';
import { ListPlanGateway } from '../gateway/list.plan.gateway';
import { ListPlanInteractor } from '../usecases/list.plan.interactor';
import { ListPlanController } from '../controllers/list.plans.controller';

const repository = new PlanRepository({ model: PlanModel });
const presenter = new Presenter();

const params = {
  planRepository: repository,
  logging: logger
};

const listGatewayPlan = new ListPlanGateway(params);
const interactor = new ListPlanInteractor({
  gateway: listGatewayPlan,
  presenter
});

export const listPlanController = new ListPlanController({
  interactor: interactor
});
