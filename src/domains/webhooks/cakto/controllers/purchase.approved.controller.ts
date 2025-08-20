import { Response, Request } from 'express';
import { PurchaseApprovedInteractor } from '../usecases/purchase.approved.interactor';
import { PurchaseApprovedControllerDependencies } from '../interfaces';

export class PurchaseApprovedController {
  protected interactor: PurchaseApprovedInteractor;

  constructor(params: PurchaseApprovedControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async purchaseApproved(
    request: Request,
    response: Response
  ): Promise<Response> {
    const httpResponse = await this.interactor.execute(request.body);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
