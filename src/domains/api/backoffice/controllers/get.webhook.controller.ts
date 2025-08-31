import { Request, Response } from 'express';
import { GetWebhookControllerDependencies } from '../interfaces/get.webhook.interfaces';
import { GetWebhookInteractor } from '../usecases/get.webhook.interactor';

export class GetWebhookController {
  protected interactor: GetWebhookInteractor;

  constructor(params: GetWebhookControllerDependencies) {
    this.interactor = params.interactor;
  }

  async list(req: Request, res: Response): Promise<Response> {
    const {
      page = '1',
      limit = '20',
      source,
      status,
      dateFrom,
      dateTo
    } = req.query;

    const input = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      source: source as string,
      status: status as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string
    };

    const result = await this.interactor.execute(input);

    return res.status(result.status).json(result.body);
  }
}
