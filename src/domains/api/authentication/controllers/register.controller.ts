import { Request, Response } from 'express';
import {
  RegisterControllerDependencies,
  InputRegister
} from '../interfaces/register.interface';
import { RegisterInteractor } from '../usecases';

export class RegisterController {
  protected interactor: RegisterInteractor;

  constructor(params: RegisterControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async register(
    request: Request,
    response: Response
  ): Promise<Response> {
    const input: InputRegister = {
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
