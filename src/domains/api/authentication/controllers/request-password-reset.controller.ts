import { Request, Response } from 'express';
import {
  RequestPasswordResetControllerDependencies,
  InputRequestPasswordReset
} from '../interfaces/request-password-reset.interface';

export class RequestPasswordResetController {
  protected interactor: RequestPasswordResetControllerDependencies['interactor'];

  constructor(params: RequestPasswordResetControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async requestPasswordReset(
    request: Request,
    response: Response
  ): Promise<Response> {
    const input: InputRequestPasswordReset = {
      email: request.body.email
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
