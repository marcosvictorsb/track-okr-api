import { Response } from 'express';
import { ListPlanInteractor } from '../usecases/list.plan.interactor';
import { ListPlanControllerDependencies } from '../interfaces/list.plan.interface';

export class ListPlanController {
  protected interactor: ListPlanInteractor;

  constructor(params: ListPlanControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async listPlan(response: Response): Promise<Response> {
    const httpResponse = await this.interactor.execute();
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
