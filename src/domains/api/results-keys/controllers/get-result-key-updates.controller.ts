import { Response } from 'express';
import {
  IGetKeyResultsUpdatesHistoryController,
  IGetKeyResultsUpdatesHistoryInteractor
} from '../interfaces/get-result-key-updates.interface';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';

export class GetKeyResultsUpdatesHistoryController
  implements IGetKeyResultsUpdatesHistoryController
{
  private interactor: IGetKeyResultsUpdatesHistoryInteractor;

  constructor(interactor: IGetKeyResultsUpdatesHistoryInteractor) {
    this.interactor = interactor;
  }

  public async getKeyResultsUpdatesHistory(
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
