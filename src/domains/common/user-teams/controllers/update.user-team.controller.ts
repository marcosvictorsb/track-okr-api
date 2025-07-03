import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import {
  UpdateUserTeamControllerDependencies,
  InputUpdateUserTeam
} from '../interfaces';
import { Response } from 'express';

export class UpdateUserTeamController {
  protected interactor: UpdateUserTeamControllerDependencies['interactor'];

  constructor(params: UpdateUserTeamControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async updateUserTeam(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const { id } = request.params;
    const { role_in_team } = request.body;

    const input: InputUpdateUserTeam = {
      id: Number(id),
      role_in_team,
      id_company: request.user.id_company,
      id_user: request.user.id
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }

  public async updateUserTeamByUserAndTeam(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const { id_user_to_update, id_team } = request.params;
    const { role_in_team } = request.body;

    const input: InputUpdateUserTeam = {
      id_user_to_update: Number(id_user_to_update),
      id_team: Number(id_team),
      role_in_team,
      id_company: request.user.id_company,
      id_user: request.user.id
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
