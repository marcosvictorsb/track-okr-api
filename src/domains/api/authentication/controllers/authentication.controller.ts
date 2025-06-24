import { Request, Response } from 'express';
import { AuthenticationDependencies } from '@domains/api/authentication/interfaces';
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
    const { email, password } = request.body;
    const result = await this.interactor.execute(email, password);
    return response.status(result.status).json(result.body);
  }
}
