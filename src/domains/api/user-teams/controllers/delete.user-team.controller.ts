import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import {
  DeleteUserTeamControllerDependencies,
  InputDeleteUserTeam
} from '../interfaces';
import { Response } from 'express';

export class DeleteUserTeamController {
  protected interactor: DeleteUserTeamControllerDependencies['interactor'];

  constructor(params: DeleteUserTeamControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async deleteUserTeam(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const { id } = request.params;
    const { force_delete } = request.query;

    const input: InputDeleteUserTeam = {
      id: Number(id),
      force_delete: force_delete === 'true',
      id_company: request.user.id_company,
      id_user: request.user.id
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }

  public async removeUserFromTeam(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const { id_user_to_remove, id_team } = request.params;
    const { force_delete } = request.query;

    const input: InputDeleteUserTeam = {
      id_user_to_remove: Number(id_user_to_remove),
      id_team: Number(id_team),
      force_delete: force_delete === 'true',
      id_company: request.user.id_company,
      id_user: request.user.id
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }

  public async leaveTeam(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const { id_team } = request.params;

    const input: InputDeleteUserTeam = {
      id_user_to_remove: request.user.id, // usuário remove a si mesmo
      id_team: Number(id_team),
      force_delete: false, // sempre soft delete quando sai voluntariamente
      id_company: request.user.id_company,
      id_user: request.user.id
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
