import { Request, Response } from 'express';
import { ProcessSubscriptionPaymentWebhookControllerDependencies } from '../interfaces/default.interfaces';
import { ProcessSubscriptionPaymentWebhookInteractor } from '../usecases/process.subscription.payment.webhook.usecase';

interface IProcessSubscriptionPaymentWebhookController {
  processSubscriptionPayment(request: Request, response: Response): Promise<Response>;
}

export class ProcessSubscriptionPaymentWebhookController
  implements IProcessSubscriptionPaymentWebhookController
{
  protected interactor: ProcessSubscriptionPaymentWebhookInteractor;

  constructor(params: ProcessSubscriptionPaymentWebhookControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async processSubscriptionPayment(
    request: Request,
    response: Response
  ): Promise<Response> {
    const input = {
      action: request.body.action,
      data: request.body.data
    }
    const result = await this.interactor.execute(input);
    return response.status(result.status).json(result.body);
  }
}
