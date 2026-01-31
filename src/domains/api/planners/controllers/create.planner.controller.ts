import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response } from 'express';
import {
  CreatePlannerControllerDependencies,
  InputCreatePlanner
} from '../interfaces';
import { CreatePlannerInteractor } from '../usecases';

export class CreatePlannerController {
  protected interactor: CreatePlannerInteractor;

  constructor(params: CreatePlannerControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async createPlanner(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const input: InputCreatePlanner = {
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
