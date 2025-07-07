import { Response } from 'express';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { CreateObjectiveControllerDependencies } from '../interfaces/create.objective.interface';

export class CreateObjectiveController {
  protected interactor: CreateObjectiveControllerDependencies['interactor'];

  constructor(params: CreateObjectiveControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async createObjective(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const { title, description, id_team, quarter, year } = request.body;
    const { id_company, id: id_user } = request.user;

    const httpResponse = await this.interactor.execute({
      title,
      description,
      id_team,
      quarter,
      year,
      id_company,
      id_user
    });

    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
