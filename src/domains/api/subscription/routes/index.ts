import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response, Router } from 'express';
import { makeGetCurrentSubscriptionController } from '../factories';
import { makeGetPlannerTrialController } from '../factories/get.planner.trial.gateway.factory';

const getCurrentSubscriptionController = makeGetCurrentSubscriptionController();
const getPlannerTrialController = makeGetPlannerTrialController();

const subscriptionRoutes = Router();

subscriptionRoutes.get(
  '/current',
  authMiddleware,
  (request: UserPayload, response: Response) =>
    getCurrentSubscriptionController.getCurrentSubscription(request, response)
);

subscriptionRoutes.get(
  '/planner-trial',
  authMiddleware,
  (request: UserPayload, response: Response) =>
    getPlannerTrialController.getPlannerTrial(request, response)
);

export { subscriptionRoutes };
