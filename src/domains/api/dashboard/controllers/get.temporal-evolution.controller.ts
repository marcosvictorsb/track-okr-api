import { Response } from 'express';
import {
  GetTemporalEvolutionControllerDependencies,
  InputGetTemporalEvolution
} from '../interfaces/get.temporal-evolution.interface';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { HttpResponse } from '@protocols/http';

export interface IGetTemporalEvolutionController {
  getTemporalEvolution(
    request: UserPayload,
    response: Response
  ): Promise<Response>;
}

export class GetTemporalEvolutionController
  implements IGetTemporalEvolutionController
{
  protected interactor: {
    execute(input: InputGetTemporalEvolution): Promise<HttpResponse>;
  };

  constructor(params: GetTemporalEvolutionControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async getTemporalEvolution(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const { quarter, year, period } = request.query;

    const input: InputGetTemporalEvolution = {
      id_company: request.user.id_company,
      id_user: request.user.id,
      quarter: quarter ? parseInt(quarter as string) : undefined,
      year: year ? parseInt(year as string) : undefined,
      period: period as 'monthly' | 'weekly' | undefined
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
