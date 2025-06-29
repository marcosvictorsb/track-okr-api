import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import {
  DeletePlannerControllerDependencies,
  InputDeletePlanner
} from '../interfaces';
import { Response } from 'express';

export class DeletePlannerController {
  protected interactor: DeletePlannerControllerDependencies['interactor'];

  constructor(params: DeletePlannerControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async deletePlanner(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const plannerId = parseInt(request.params.id as string);

    const input: InputDeletePlanner = {
      id: plannerId,
      id_company: request.user.id_company,
      id_user: request.user.id
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
