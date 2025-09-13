import { authMiddleware, UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response, Router } from 'express';
import { makeGetCurrentSubscriptionController } from '../factories';

const getCurrentSubscriptionController = makeGetCurrentSubscriptionController();

const subscriptionRoutes = Router();

subscriptionRoutes.get(
  '/current',
  authMiddleware,
  (request: UserPayload, response: Response) =>
    getCurrentSubscriptionController.getCurrentSubscription(request, response)
);

export { subscriptionRoutes };
