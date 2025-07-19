import { Response } from 'express';
import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import {
  CreateResultKeyUpdateControllerDependencies,
  InputCreateResultKeyUpdate
} from '../interfaces/create-result-key-update.interface';

export class CreateResultKeyUpdateController {
  protected interactor: CreateResultKeyUpdateControllerDependencies['interactor'];

  constructor(params: CreateResultKeyUpdateControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async createUpdate(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const resultKeyId = parseInt(request.params.id as string);
    const { new_value, comment } = request.body;

    const input: InputCreateResultKeyUpdate = {
      id_result_key: resultKeyId,
      new_value: parseFloat(new_value),
      comment: comment || undefined,
      id_company: request.user.id_company,
      id_user: request.user.id
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
