import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import {
  CreateUserTeamControllerDependencies,
  InputCreateUserTeam
} from '../interfaces';
import { Response } from 'express';

export class CreateUserTeamController {
  protected interactor: CreateUserTeamControllerDependencies['interactor'];

  constructor(params: CreateUserTeamControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async createUserTeam(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const { id_user_to_add, id_team, role_in_team } = request.body;

    const input: InputCreateUserTeam = {
      id_user_to_add,
      id_team,
      role_in_team,
      id_company: request.user.id_company,
      id_user: request.user.id
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
