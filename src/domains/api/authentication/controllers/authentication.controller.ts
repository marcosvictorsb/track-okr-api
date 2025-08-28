import { Request, Response } from 'express';
import {
  AuthenticationDependencies,
  InputAuthentication
} from '@domains/api/authentication/interfaces';
import { AuthenticationInteractor } from '@domains/api/authentication/usecases/authentication.interactor';

export class AuthenticationController {
  private interactor: AuthenticationInteractor;

  constructor(params: AuthenticationDependencies) {
    this.interactor = params.interactor;
  }

  public async authentication(
    request: Request,
    response: Response
  ): Promise<Response> {
    const { email, password, rememberMe } = request.body;
    const credential: InputAuthentication = {
      email,
      password,
      rememberMe: rememberMe || false
    };

    const result = await this.interactor.execute(credential);
    return response.status(result.status).json(result.body);
  }
}
