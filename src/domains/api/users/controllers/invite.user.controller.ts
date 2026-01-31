import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response } from 'express';
import {
  InputInviteUser,
  InviteUserControllerDependencies
} from '../interfaces';

export class InviteUserController {
  protected interactor: InviteUserControllerDependencies['interactor'];

  constructor(params: InviteUserControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async inviteUser(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const input: InputInviteUser = {
      email: request.body.email,
      name: request.body.name,
      role: request.body.role,
      teamId: request.body.teamId
        ? parseInt(request.body.teamId as string)
        : undefined,
      id_company: request.user.id_company,
      id_user: request.user.id
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
