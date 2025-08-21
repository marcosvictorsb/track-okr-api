import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import {
  ActivateUserPurchaseControllerDependencies,
  InputActivateUserPurchase
} from '../interfaces/activate.user.purchase.interface';
import { Response } from 'express';

export class ActivateUserPurchaseController {
  protected interactor: ActivateUserPurchaseControllerDependencies['interactor'];

  constructor(params: ActivateUserPurchaseControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async activateUserPurchase(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const input: InputActivateUserPurchase = {
      id_company: request.user.id_company,
      id_user: request.user.id,
      email: request.body.email,
      password: request.body.password,
      company_name: request.body.company_name,
      company_document: request.body.company_document
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
