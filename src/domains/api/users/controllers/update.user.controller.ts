import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response } from 'express';
import {
  InputUpdateUser,
  UpdateUserControllerDependencies
} from '../interfaces';

export class UpdateUserController {
  protected interactor: UpdateUserControllerDependencies['interactor'];

  constructor(params: UpdateUserControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async updateUser(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const userIdToUpdate = parseInt(request.params.id as string);
    const { name, email, role } = request.body;

    const input: InputUpdateUser = {
      id: userIdToUpdate,
      name,
      email,
      role,
      id_company: request.user.id_company,
      id_user: request.user.id,
      teamId: request.body.current_team_id
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
