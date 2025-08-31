import { Request, Response } from 'express';
import { GetLeadControllerDependencies } from '../interfaces/get.lead.interfaces';
import { GetLeadInteractor } from '../usecases/get.lead.interactor';

export class GetLeadController {
  protected interactor: GetLeadInteractor;

  constructor(params: GetLeadControllerDependencies) {
    this.interactor = params.interactor;
  }

  async list(req: Request, res: Response): Promise<Response> {
    const {
      page = '1',
      limit = '20',
      status,
      source,
      company,
      company_size,
      utm_source,
      utm_medium,
      utm_campaign,
      email,
      dateFrom,
      dateTo
    } = req.query;

    const input = {
      page: parseInt(page as string, 10),
      limit: parseInt(limit as string, 10),
      status: status as
        | 'new'
        | 'contacted'
        | 'qualified'
        | 'converted'
        | 'lost',
      source: source as string,
      company: company as string,
      company_size: company_size as string,
      utm_source: utm_source as string,
      utm_medium: utm_medium as string,
      utm_campaign: utm_campaign as string,
      email: email as string,
      dateFrom: dateFrom as string,
      dateTo: dateTo as string
    };

    const result = await this.interactor.execute(input);

    return res.status(result.status).json(result.body);
  }
}
