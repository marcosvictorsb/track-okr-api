import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import {
  DeleteUserControllerDependencies,
  InputDeleteUser
} from '../interfaces';
import { Response } from 'express';

export class DeleteUserController {
  protected interactor: DeleteUserControllerDependencies['interactor'];

  constructor(params: DeleteUserControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async deleteUser(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const userIdToDelete = parseInt(request.params.id as string);

    const input: InputDeleteUser = {
      id_user_to_delete: userIdToDelete,
      id_company: request.user.id_company,
      id_user: request.user.id
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
