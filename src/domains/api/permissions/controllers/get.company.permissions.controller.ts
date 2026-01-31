import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response } from 'express';
import { GetCompanyPermissionsControllerDependencies } from '../interfaces/get.company.permissions.interface';
import { GetCompanyPermissionsInteractor } from '../usecases/get.company.permissions.interactor';

export class GetCompanyPermissionsController {
  protected interactor: GetCompanyPermissionsInteractor;

  constructor(params: GetCompanyPermissionsControllerDependencies) {
    this.interactor = params.interactor;
  }

  async getCompanyPermissions(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const id_company = request.user.id_company;
    const id_user = request.user.id;

    const result = await this.interactor.execute({
      id_company,
      id_user
    });

    return response.status(result.status).json(result.body);
  }
}
