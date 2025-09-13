import { UserPayload } from '@middlewares/auth.jwt.middlewares';
import { Response } from 'express';
import { InputGetCurrentSubscription } from '../interfaces/get-current-subscription.interface';

export interface GetCurrentSubscriptionControllerDependencies {
  interactor: {
    execute(
      input: InputGetCurrentSubscription
    ): Promise<{ status: number; body: unknown }>;
  };
}

export class GetCurrentSubscriptionController {
  protected interactor: GetCurrentSubscriptionControllerDependencies['interactor'];

  constructor(params: GetCurrentSubscriptionControllerDependencies) {
    this.interactor = params.interactor;
  }

  public async getCurrentSubscription(
    request: UserPayload,
    response: Response
  ): Promise<Response> {
    const input: InputGetCurrentSubscription = {
      id_user: Number(request.user.id),
      id_company: Number(request.user.id_company)
    };

    const httpResponse = await this.interactor.execute(input);
    return response.status(httpResponse.status).json(httpResponse.body);
  }
}
