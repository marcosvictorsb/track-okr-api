import { Response } from 'express';
import {
  IGetProfileController,
  IGetProfileInteractor,
  InputGetProfile,
  GetProfileControllerDependencies
} from '../interfaces/get.profile.interface';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';

export class GetProfileController implements IGetProfileController {
  protected interactor: IGetProfileInteractor;

  constructor(params: GetProfileControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async getProfile(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const input: InputGetProfile = {
      id_company: request.user.id_company,
      id_user: request.user.id
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
