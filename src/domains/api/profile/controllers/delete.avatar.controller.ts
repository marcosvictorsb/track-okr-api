import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response } from 'express';
import {
  DeleteAvatarControllerDependencies,
  IDeleteAvatarController,
  IDeleteAvatarInteractor,
  InputDeleteAvatar
} from '../interfaces/delete.avatar.interface';

export class DeleteAvatarController implements IDeleteAvatarController {
  private interactor: IDeleteAvatarInteractor;

  constructor(params: DeleteAvatarControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async deleteAvatar(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const input: InputDeleteAvatar = {
      id_user: request.user.id,
      id_company: request.user.id_company
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
