import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response } from 'express';
import {
  InputUpdateObjective,
  UpdateObjectiveControllerDependencies
} from '../interfaces';

export class UpdateObjectiveController {
  protected interactor: UpdateObjectiveControllerDependencies['interactor'];

  constructor(params: UpdateObjectiveControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async updateObjective(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const objectiveId = parseInt(request.params.id as string);

    const input: InputUpdateObjective = {
      id: objectiveId,
      title: request.body.title,
      description: request.body.description,
      status: request.body.status,
      quarter: request.body.quarter
        ? parseInt(request.body.quarter as string)
        : undefined,
      year: request.body.year
        ? parseInt(request.body.year as string)
        : undefined,
      id_company: request.user.id_company,
      id_user: request.user.id,
      id_team: request.body.id_team
        ? parseInt(request.body.id_team as string)
        : undefined,
      id_planner: request.body.id_planner
        ? parseInt(request.body.id_planner as string)
        : undefined
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
