import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import {
  DeleteTeamControllerDependencies,
  InputDeleteTeam
} from '../interfaces';
import { Response } from 'express';

export class DeleteTeamController {
  protected interactor: DeleteTeamControllerDependencies['interactor'];

  constructor(params: DeleteTeamControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async deleteTeam(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const teamId = parseInt(request.params.id as string);

    const input: InputDeleteTeam = {
      id: teamId,
      id_company: request.user.id_company,
      id_user: request.user.id
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
