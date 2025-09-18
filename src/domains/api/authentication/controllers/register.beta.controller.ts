import { Request, Response } from 'express';
import {
  InputRegisterBeta,
  RegisterBetaControllerDependencies
} from '../interfaces/register.beta.interface';
import { RegisterBetaInteractor } from '../usecases/register.beta.interactor';

export class RegisterBetaController {
  protected interactor: RegisterBetaInteractor;

  constructor(params: RegisterBetaControllerDependencies) {
    this.interactor = params.interactor as RegisterBetaInteractor;
  }

  public async registerBeta(
    request: Request,
    response: Response
  ): Promise<Response> {
    const input: InputRegisterBeta = {
      name: request.body.name,
      email: request.body.email,
      company_name: request.body.company_name,
      website: request.body.website,
      plan: request.body.plan,
      is_beta_tester: request.body.is_beta_tester
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
