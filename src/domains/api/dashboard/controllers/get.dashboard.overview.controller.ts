import { Response } from 'express';
import {
  IGetDashboardOverviewController,
  GetDashboardOverviewControllerDependencies,
  InputGetDashboardOverview
} from '../interfaces/get.dashboard.overview.interface';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';

export class GetDashboardOverviewController
  implements IGetDashboardOverviewController
{
  protected interactor: GetDashboardOverviewControllerDependencies['interactor'];

  constructor(params: GetDashboardOverviewControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async getOverview(
    request: UserPayload,
    response: Response
  ): Promise<void> {
    const { quarter, year, team, status } = request.query;
    const { id_company, id: id_user } = request.user;

    const input: InputGetDashboardOverview = {
      quarter: quarter ? Number(quarter) : undefined,
      year: year ? Number(year) : undefined,
      team: team as string,
      status: status as string,
      id_company,
      id_user
    };

    const httpResponse = await this.interactor.execute(input);
    response.status(httpResponse.status).json(httpResponse.body);
  }
}
