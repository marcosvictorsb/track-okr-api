import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response } from 'express';
import {
  DeactivateUserControllerDependencies,
  InputDeactivateUser
} from '../interfaces';

export class DeactivateUserController {
  protected interactor: DeactivateUserControllerDependencies['interactor'];

  constructor(params: DeactivateUserControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async deactivateUser(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const userIdToDeactivate = parseInt(request.params.id as string);

    const input: InputDeactivateUser = {
      id_user_to_deactivate: userIdToDeactivate,
      id_company: request.user.id_company,
      id_user: request.user.id
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
