import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response } from 'express';
import {
  CreateCheckinsControllerDependencies,
  InputCreateCheckins
} from '../interfaces/create.checkins.interface';

export class CreateCheckinsController {
  protected interactor: CreateCheckinsControllerDependencies['interactor'];

  constructor(params: CreateCheckinsControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async createUpdate(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const resultKeyId = parseInt(request.params.id as string);
    const { new_value, comment } = request.body;

    const input: InputCreateCheckins = {
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
