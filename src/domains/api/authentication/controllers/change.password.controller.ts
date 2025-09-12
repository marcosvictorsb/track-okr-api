import { Request, Response } from 'express';
import {
  ChangePasswordControllerDependencies,
  InputChangePassword
} from '../interfaces/';

export class ChangePasswordController {
  protected interactor: ChangePasswordControllerDependencies['interactor'];

  constructor(params: ChangePasswordControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async changePassword(
    request: Request,
    response: Response
  ): Promise<Response> {
    const input: InputChangePassword = {
      token: request.body.token,
      password: request.body.password
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
