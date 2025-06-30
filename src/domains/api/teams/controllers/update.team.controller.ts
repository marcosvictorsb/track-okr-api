import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import {
  UpdateTeamControllerDependencies,
  InputUpdateTeam
} from '../interfaces';
import { Response } from 'express';

export class UpdateTeamController {
  protected interactor: UpdateTeamControllerDependencies['interactor'];

  constructor(params: UpdateTeamControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async updateTeam(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const teamId = parseInt(request.params.id as string);

    const input: InputUpdateTeam = {
      id: teamId,
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
