import {
  GetEvolutionControllerDependencies,
  IGetEvolutionController,
  InputGetEvolution
} from '@domains/api/evolution/interfaces/get.evolution.interface';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response } from 'express';

export class GetEvolutionController implements IGetEvolutionController {
  protected interactor: GetEvolutionControllerDependencies['interactor'];

  constructor(params: GetEvolutionControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async getEvolution(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const { year, granularity, teams, responsibles, quarter } = request.query;
    const { id_company, id: id_user } = request.user;

    const input: InputGetEvolution = {
      year: Number(year),
      granularity: granularity as 'monthly' | 'weekly',
      teams: teams as string[] | undefined,
      responsibles: responsibles as string[] | undefined,
      quarter: quarter ? Number(quarter) : undefined,
      id_company,
      id_user
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
