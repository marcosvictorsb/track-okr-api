import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response } from 'express';
import {
  GetSettingControllerDependencies,
  InputGetSetting
} from '../interfaces';
import { GetSettingInteractor } from '../usecases';

export class GetSettingController {
  protected interactor: GetSettingInteractor;

  constructor(params: GetSettingControllerDependencies) {
    this.interactor = params.interactor as GetSettingInteractor;
  }

  public async getSetting(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const input: InputGetSetting = {
      id_company: request.user.id_company,
      id_user: request.user.id
    };
    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
