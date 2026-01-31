import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response } from 'express';
import {
  GetAnnualPlanningControllerDependencies,
  IGetAnnualPlanningController,
  InputGetAnnualPlanning
} from '../interfaces/get.annual.planning.interface';

export class GetAnnualPlanningController implements IGetAnnualPlanningController {
  protected interactor: GetAnnualPlanningControllerDependencies['interactor'];

  constructor(dependencies: GetAnnualPlanningControllerDependencies) {
    this.interactor = dependencies.interactor;
  }

  async getAnnualPlanning(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const { year, quarter } = request.query;
    const { id_company, id: id_user } = request.user;

    const input: InputGetAnnualPlanning = {
      id_company,
      id_user,
      year: year ? Number(year) : new Date().getFullYear(),
      quarter: Number(quarter)
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
