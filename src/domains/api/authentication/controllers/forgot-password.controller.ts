import { Request, Response } from 'express';
import {
  ForgotPasswordControllerDependencies,
  InputForgotPassword
} from '../interfaces/forgot-password.interface';

export class ForgotPasswordController {
  protected interactor: ForgotPasswordControllerDependencies['interactor'];

  constructor(params: ForgotPasswordControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async forgotPassword(
    request: Request,
    response: Response
  ): Promise<Response> {
    const input: InputForgotPassword = {
      email: request.body.email
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
