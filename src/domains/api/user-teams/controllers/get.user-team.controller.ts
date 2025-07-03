import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import {
  GetUserTeamControllerDependencies,
  InputGetUserTeam
} from '../interfaces';
import { Response } from 'express';

export class GetUserTeamController {
  protected interactor: GetUserTeamControllerDependencies['interactor'];

  constructor(params: GetUserTeamControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async getUserTeams(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const { id_team, id_user_to_find, role_in_team, include_left } =
      request.query;

    const input: InputGetUserTeam = {
      id_company: request.user.id_company,
      id_user: request.user.id,
      id_team: id_team ? Number(id_team) : undefined,
      id_user_to_find: id_user_to_find ? Number(id_user_to_find) : undefined,
      role_in_team: role_in_team as string,
      include_left: include_left === 'true'
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }

  public async getUserTeamsByTeam(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const { id_team } = request.params;
    const { role_in_team, include_left } = request.query;

    const input: InputGetUserTeam = {
      id_company: request.user.id_company,
      id_user: request.user.id,
      id_team: Number(id_team),
      role_in_team: role_in_team as string,
      include_left: include_left === 'true'
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }

  public async getUserTeamsByUser(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const { id_user } = request.params;
    const { role_in_team, include_left } = request.query;

    const input: InputGetUserTeam = {
      id_company: request.user.id_company,
      id_user: request.user.id,
      id_user_to_find: Number(id_user),
      role_in_team: role_in_team as string,
      include_left: include_left === 'true'
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
