import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response } from 'express';
import {
  CreateExportRequestControllerDependencies,
  InputCreateExportRequest
} from '../interfaces/create.export.request.interface';

export class CreateExportRequestController {
  protected interactor: CreateExportRequestControllerDependencies['interactor'];

  constructor(params: CreateExportRequestControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async createExportRequest(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const input: InputCreateExportRequest = {
      id_user: request.user.id,
      id_company: request.user.id_company
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
