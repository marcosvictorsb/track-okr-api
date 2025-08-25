import { Response } from 'express';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import {
  DeleteResultKeyControllerDependencies,
  InputDeleteResultKey
} from '../interfaces/delete.result.key.interface';

export class DeleteResultKeyController {
  protected interactor: DeleteResultKeyControllerDependencies['interactor'];

  constructor(params: DeleteResultKeyControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async handle(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const id = parseInt(request.params.id as string);

    const input: InputDeleteResultKey = {
      id,
      id_company: request.user.id_company,
      id_user: request.user.id
    };
    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
