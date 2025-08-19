import { Request, Response, Router } from 'express';
import * as factories from '../factories';

const { makeRecurringPaymentController } = factories;

const recurringPaymentController = makeRecurringPaymentController();

const router = Router();

router.post('/cakto', (request: Request, response: Response) =>
  recurringPaymentController.recurringPayment(request, response)
);

export default router;
