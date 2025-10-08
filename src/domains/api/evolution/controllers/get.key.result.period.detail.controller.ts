import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response } from 'express';
import {
  GetKeyResultPeriodDetailControllerDependencies,
  IGetKeyResultPeriodDetailController,
  InputGetKeyResultPeriodDetail
} from '../interfaces/get.key.evolution.interface';

export class GetKeyResultPeriodDetailController
  implements IGetKeyResultPeriodDetailController
{
  protected interactor: GetKeyResultPeriodDetailControllerDependencies['interactor'];

  constructor(params: GetKeyResultPeriodDetailControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async getKeyResultPeriodDetail(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const { kr_id, period } = request.params;
    const { id_company, id: id_user } = request.user;

    const input: InputGetKeyResultPeriodDetail = {
      kr_id: Number(kr_id),
      period,
      id_company,
      id_user
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
