import { Request, Response } from 'express';
import { KirvanoWebhookControllerDependencies } from '../interfaces/kirvano.webhook.interfaces';
import { KirvanoWebhookInteractor } from '../usecases/kirvano.webhook.interactor';

export class KirvanoWebhookController {
  protected interactor: KirvanoWebhookInteractor;

  constructor(params: KirvanoWebhookControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async handle(request: Request, response: Response): Promise<Response> {
    const httpResponse = await this.interactor.execute(request.body);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
