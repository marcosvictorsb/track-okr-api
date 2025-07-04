import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import {
  ActivateUserControllerDependencies,
  InputActivateUser
} from '../interfaces/activate.user.interface';
import { Response } from 'express';

export class ActivateUserController {
  protected interactor: ActivateUserControllerDependencies['interactor'];

  constructor(params: ActivateUserControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async activateUser(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const userIdToActivate = parseInt(request.params.id as string);

    const input: InputActivateUser = {
      id_user_to_activate: userIdToActivate,
      id_company: request.user.id_company,
      id_user: request.user.id
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
