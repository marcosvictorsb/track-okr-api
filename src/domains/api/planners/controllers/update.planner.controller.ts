import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response } from 'express';
import {
  InputUpdatePlanner,
  UpdatePlannerControllerDependencies
} from '../interfaces';

export class UpdatePlannerController {
  protected interactor: UpdatePlannerControllerDependencies['interactor'];

  constructor(params: UpdatePlannerControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async updatePlanner(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const plannerId = parseInt(request.params.id as string);

    const input: InputUpdatePlanner = {
      id: plannerId,
      title: request.body.title,
      description: request.body.description,
      year: parseInt(request.body.year as string),
      id_company: request.user.id_company,
      id_user: request.user.id
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
