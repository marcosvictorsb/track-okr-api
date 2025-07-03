import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import {
  ManageUserTeamControllerDependencies,
  InputManageUserTeam
} from '../interfaces';
import { Response } from 'express';

export class ManageUserTeamController {
  protected interactor: ManageUserTeamControllerDependencies['interactor'];

  constructor(params: ManageUserTeamControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async manageUserTeam(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const { id_user_to_manage, id_team } = request.body;

    const input: InputManageUserTeam = {
      id_user_to_manage,
      id_team,
      id_company: request.user.id_company,
      id_user: request.user.id
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
