import { Response } from 'express';
import {
  GetTeamPerformanceControllerDependencies,
  InputGetTeamPerformance
} from '../interfaces/get.team.performance.interface';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';

const getCurrentQuarter = (): number => {
  const currentMonth = new Date().getMonth();
  return Math.floor(currentMonth / 3) + 1;
};
export class GetTeamPerformanceController {
  protected interactor: GetTeamPerformanceControllerDependencies['interactor'];

  constructor(params: GetTeamPerformanceControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async getTeamPerformance(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const { quarter, year } = request.query;
    const input: InputGetTeamPerformance = {
      id_company: request.user.id_company,
      id_user: request.user.id,
      quarter: quarter ? Number(quarter) : getCurrentQuarter(),
      year: year ? Number(year) : getCurrentQuarter()
    };

    const httpResponse = await this.interactor.execute(input);

    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
