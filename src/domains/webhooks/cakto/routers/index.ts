import { Request, Response, Router } from 'express';
import * as factories from '../factories';

const { makePurchaseApprovedController } = factories;

const purchaseApprovedController = makePurchaseApprovedController();

const router = Router();

router.post(
  '/cakto/purchase-approved',
  (request: Request, response: Response) =>
    purchaseApprovedController.purchaseApproved(request, response)
);

export default router;
