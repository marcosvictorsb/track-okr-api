import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response } from 'express';
import { InputGetPlannerTrial } from '../interfaces/get.planner.trial.interface';

export interface GetPlannerTrialControllerDependencies {
  interactor: {
    execute(
      input: InputGetPlannerTrial
    ): Promise<{ status: number; body: unknown }>;
  };
}

export class GetPlannerTrialController {
  protected interactor: GetPlannerTrialControllerDependencies['interactor'];

  constructor(params: GetPlannerTrialControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async getPlannerTrial(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const input: InputGetPlannerTrial = {
      id_user: Number(request.user.id),
      id_company: Number(request.user.id_company)
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
