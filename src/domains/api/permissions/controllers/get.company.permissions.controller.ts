import { Response } from 'express';
import { CustomRequest } from '@protocols/http';
import { GetCompanyPermissionsControllerDependencies } from '../interfaces/get.company.permissions.interface';
import { GetCompanyPermissionsInteractor } from '../usecases/get.company.permissions.interactor';

export class GetCompanyPermissionsController {
  protected interactor: GetCompanyPermissionsInteractor;

  constructor(params: GetCompanyPermissionsControllerDependencies) {
    this.interactor = params.interactor;
  }

  async getCompanyPermissions(
    request: CustomRequest,
    response: Response
  ): Promise<Response> {
    const id_company = parseInt(request.params.id_company, 10);
    const id_user = request.user.id;

    const result = await this.interactor.execute({
      id_company,
      id_user
    });

    return response.status(result.status).json(result.body);
  }
}
