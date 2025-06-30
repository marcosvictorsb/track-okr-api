import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import {
  CreateTeamControllerDependencies,
  InputCreateTeam
} from '../interfaces';
import { Response } from 'express';

export class CreateTeamController {
  protected interactor: CreateTeamControllerDependencies['interactor'];

  constructor(params: CreateTeamControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async createTeam(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const input: InputCreateTeam = {
      name: request.body.name,
      description: request.body.description,
      amount_users: parseInt(request.body.amount_users as string),
      id_company: request.user.id_company,
      id_user: request.user.id
    };
    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
