import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response } from 'express';
import { GetUserControllerDependencies, InputGetUser } from '../interfaces';
import { GetUserInteractor } from '../usecases';

export class GetUserController {
  protected interactor: GetUserInteractor;

  constructor(params: GetUserControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async getUsers(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const input: InputGetUser = {
      id_company: request.user.id_company,
      id_user: request.user.id
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
