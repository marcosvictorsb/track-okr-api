import { Request, Response, Router } from 'express';
import * as factories from '../factories';

const { makePurchaseApprovedController, makeKirvanoWebhookController } =
  factories;

const purchaseApprovedController = makePurchaseApprovedController();
const kirvanoWebhookController = makeKirvanoWebhookController();

const router = Router();

router.post(
  '/cakto/purchase-approved',
  (request: Request, response: Response) =>
    purchaseApprovedController.purchaseApproved(request, response)
);

router.post('/kirvano', (request: Request, response: Response) =>
  kirvanoWebhookController.handle(request, response)
);

export default router;
