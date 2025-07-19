import { Response } from 'express';
import {
  IGetCheckinsController,
  IGetCheckinsInteractor
} from '../interfaces/get.checkins.interface';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';

export class GetCheckinsController implements IGetCheckinsController {
  private interactor: IGetCheckinsInteractor;

  constructor(interactor: IGetCheckinsInteractor) {
    this.interactor = interactor;
  }

  public async getCheckins(
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
