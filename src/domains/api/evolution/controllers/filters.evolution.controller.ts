import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response } from 'express';
import {
  FiltersControllerDependencies,
  IFiltersEvolutionController,
  InputFiltersEvolution
} from '../interfaces/filters.evolution.interface';
import { FiltersEvolutionInteractor } from '../usecases/filters.evolution.interactor';

export class FiltersEvolutionController implements IFiltersEvolutionController {
  protected interactor: FiltersEvolutionInteractor;

  constructor(params: FiltersControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async getFilters(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const { id_company, id: id_user } = request.user;

    const input: InputFiltersEvolution = {
      id_company,
      id_user
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
