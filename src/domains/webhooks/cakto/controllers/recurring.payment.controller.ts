import { Response, Request } from 'express';
import { RecurringPaymentInteractor } from '../usecases/recurring.payment.interactor';
import { RecurringPaymentControllerDependencies } from '../interfaces';

export class RecurringPaymentController {
  protected interactor: RecurringPaymentInteractor;

  constructor(params: RecurringPaymentControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async recurringPayment(
    request: Request,
    response: Response
  ): Promise<Response> {
    console.log(request.body);
    const httpResponse = await this.interactor.execute(request.body);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
