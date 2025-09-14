import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response } from 'express';
import {
  CreateSupportContactControllerDependencies,
  ICreateSupportContactInteractor,
  InputCreateSupportContact
} from '../interfaces';

export class CreateSupportContactController {
  protected interactor: ICreateSupportContactInteractor;

  constructor(params: CreateSupportContactControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async create(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const input: InputCreateSupportContact = {
      user_id: request.user.id || null,
      company_id: request.user.id_company || null,
      contact_preference: request.body.contact_preference,
      contact_value: request.body.contact_info,
      message: request.body.message,
      ip_address: request.ip || null,
      user_agent: request.get('User-Agent') || null,
      metadata: request.body.metadata || null,
      name: request.user.name || 'No name provided'
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
