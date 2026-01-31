import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { HttpResponse } from '@protocols/http';
import { Response } from 'express';
import {
  CheckUserActiveControllerDependencies,
  InputCheckUserActive
} from '../interfaces';
import { CheckUserActiveInteractor } from '../usecases/check.user.active.interactor';

export class CheckUserActiveController {
  protected interactor: CheckUserActiveInteractor;

  constructor(params: CheckUserActiveControllerDependencies) {
    this.interactor = params.interactor;
  }

  async checkUserActive(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const input: InputCheckUserActive = {
      id_company: request.user.id_company,
      id_user: request.user.id
    };

    const result: HttpResponse = await this.interactor.execute(input);

    return response.status(result.status).json(result.body);
  }
}
