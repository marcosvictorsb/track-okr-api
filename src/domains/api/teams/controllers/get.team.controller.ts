import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response } from 'express';
import { GetTeamControllerDependencies, InputGetTeam } from '../interfaces';

export class GetTeamController {
  protected interactor: GetTeamControllerDependencies['interactor'];

  constructor(params: GetTeamControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async getTeam(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const input: InputGetTeam = {
      id_company: request.user.id_company,
      id_user: request.user.id,
      limite: request.query.limite
        ? parseInt(request.query.limite as string)
        : 10,
      name: request.query.name as string
    };
    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
