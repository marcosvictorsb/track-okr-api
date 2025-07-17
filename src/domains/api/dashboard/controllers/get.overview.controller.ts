import { Response } from 'express';
import {
  IGetOverviewController,
  GetOverviewControllerDependencies,
  InputGetOverview
} from '../interfaces/get.overview.interface';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';

export class GetOverviewController implements IGetOverviewController {
  protected interactor: GetOverviewControllerDependencies['interactor'];

  constructor(params: GetOverviewControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async getOverview(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const { quarter, year, team, status } = request.query;
    const { id_company, id: id_user } = request.user;

    const input: InputGetOverview = {
      quarter: quarter ? Number(quarter) : undefined,
      year: year ? Number(year) : undefined,
      team: team as string,
      status: status as string,
      id_company,
      id_user
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
