import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response } from 'express';
import {
  GetTopContributorsControllerDependencies,
  InputGetTopContributors
} from '../interfaces/get.top.contributors.interface';

export class GetTopContributorsController {
  protected interactor: GetTopContributorsControllerDependencies['interactor'];

  constructor(params: GetTopContributorsControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async getTopContributors(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const input: InputGetTopContributors = {
      id_company: request.user.id_company,
      id_user: request.user.id,
      quarter: request.query.quarter
        ? parseInt(request.query.quarter as string)
        : undefined,
      year: request.query.year
        ? parseInt(request.query.year as string)
        : undefined,
      limit: request.query.limit ? parseInt(request.query.limit as string) : 10,
      page: request.query.page ? parseInt(request.query.page as string) : 1
    };

    const httpResponse = await this.interactor.execute(input);

    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
