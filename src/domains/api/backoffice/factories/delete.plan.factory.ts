import { PlanRepository } from '../repository/plan.repository';
import { DeletePlanGateway } from '../gateway/delete.plan.gateway';
import { DeletePlanInteractor } from '../usecases/delete.plan.interactor';
import { DeletePlanController } from '../controllers/delete.plan.controller';
import { PlanModel } from '../models/plan.model';
import { logger } from '@configs/logger';
import { Presenter } from '@protocols/presenter';
import { SubscriptionRepository } from '@domains/common/subscriptions/repository/subscription.repository';
import SubscriptionModel from '@domains/common/subscriptions/model/subscription.model';

// Repository
const planRepository = new PlanRepository({
  model: PlanModel
});

// Gateway
const deletePlanGateway = new DeletePlanGateway({
  planRepository,
  subscriptionRepository: new SubscriptionRepository({
    model: SubscriptionModel
  }),
  logging: logger
});

// Presenter
const presenter = new Presenter();

// Interactor
const deletePlanInteractor = new DeletePlanInteractor({
  gateway: deletePlanGateway,
  presenter
});

// Controller
const deletePlanController = new DeletePlanController({
  interactor: deletePlanInteractor
});

export { deletePlanController };
