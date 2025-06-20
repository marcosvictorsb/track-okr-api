import { Request, Response, Router } from 'express';
import * as factories from '../factories';

const { createFeatureFlagController } = factories;

const router = Router();

router.post('/mercado-pago', (request: Request, response: Response) =>
  createFeatureFlagController.processSubscriptionPayment(request, response)
);


export default router;
