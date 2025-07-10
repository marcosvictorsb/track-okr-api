import { Response } from 'express';
import {
  IGetKeyResultUpdateController,
  IGetKeyResultUpdateInteractor
} from '../interfaces/get-result-key-updates.interface';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';

export class GetKeyResultUpdateController
  implements IGetKeyResultUpdateController
{
  private interactor: IGetKeyResultUpdateInteractor;

  constructor(interactor: IGetKeyResultUpdateInteractor) {
    this.interactor = interactor;
  }

  public async getKeyResultUpdate(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const httpResponse = await this.interactor.execute({
      id_result_key: parseInt(request.params.id as string),
      id_company: request.user.id_company,
      id_user: request.user.id
    });

    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
