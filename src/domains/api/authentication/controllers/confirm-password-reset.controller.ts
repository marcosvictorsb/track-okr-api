import { Request, Response } from 'express';
import {
  ConfirmPasswordResetControllerDependencies,
  InputConfirmPasswordReset
} from '../interfaces/confirm-password-reset.interface';

export class ConfirmPasswordResetController {
  protected interactor: ConfirmPasswordResetControllerDependencies['interactor'];

  constructor(params: ConfirmPasswordResetControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async confirmPasswordReset(
    request: Request,
    response: Response
  ): Promise<Response> {
    const input: InputConfirmPasswordReset = {
      token: request.body.token,
      newPassword: request.body.password
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
