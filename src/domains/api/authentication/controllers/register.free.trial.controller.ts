import { Request, Response } from 'express';
import {
  InputRegisterFreeTrial,
  RegisterFreeTrialControllerDependencies
} from '../interfaces/register.free.trial.interface';
import { RegisterFreeTrialInteractor } from '../usecases';

export class RegisterController {
  protected interactor: RegisterFreeTrialInteractor;

  constructor(params: RegisterFreeTrialControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async register(
    request: Request,
    response: Response
  ): Promise<Response> {
    const input: InputRegisterFreeTrial = {
      name: request.body.name,
      email: request.body.email,
      password: request.body.password,
      company_name: request.body.company_name,
      plan: request.body.plan
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
