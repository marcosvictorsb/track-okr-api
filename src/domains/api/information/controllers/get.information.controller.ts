import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response } from 'express';
import {
  GetInformationControllerDependencies,
  InputGetInformation
} from '../interfaces';
import { GetInformationInteractor } from '../usecases';

export class GetInformationController {
  protected interactor: GetInformationInteractor;

  constructor(params: GetInformationControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async getInformation(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const input: InputGetInformation = {
      id_company: request.user.id_company,
      id_user: request.user.id
    };
    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
