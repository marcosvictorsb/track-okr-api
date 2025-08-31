import { GetSubscriptionInteractor } from '../usecases/get.subscription.interactor';
import { GetSubscriptionGateway } from '../gateways/get.subscription.gateway';
import { GetSubscriptionController } from '../controllers/get.subscription.controller';
import { SubscriptionRepository } from '@domains/common/subscriptions/repository/subscription.repository';
import { SubscriptionHistoryRepository } from '@domains/common/subscriptions/repository/subscription.history.repository';
import { PlanRepository } from '../repository/plan.repository';
import SubscriptionModel from '@domains/common/subscriptions/model/subscription.model';
import SubscriptionHistoryModel from '@domains/common/subscriptions/model/subscription.history.model';
import { PlanModel } from '../models/plan.model';
import { logger } from '@configs/logger';
import { Presenter } from '@protocols/presenter';

// Repositories
const subscriptionRepository = new SubscriptionRepository({
  model: SubscriptionModel
});

const subscriptionHistoryRepository = new SubscriptionHistoryRepository({
  model: SubscriptionHistoryModel
});

const planRepository = new PlanRepository({
  model: PlanModel
});

// Gateway
const getSubscriptionGateway = new GetSubscriptionGateway({
  subscriptionRepository,
  subscriptionHistoryRepository,
  planRepository,
  logging: logger
});

// Presenter
const presenter = new Presenter();

// Interactor
const getSubscriptionInteractor = new GetSubscriptionInteractor({
  gateway: getSubscriptionGateway,
  presenter
});

// Controller
const getSubscriptionController = new GetSubscriptionController(
  getSubscriptionInteractor
);

export { getSubscriptionController };
