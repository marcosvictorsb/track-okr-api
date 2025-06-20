import { IPresenter } from "@protocols/presenter";
import { ProcessSubscriptionPaymentWebhookInteractor } from '../usecases/process.subscription.payment.webhook.usecase';
import { ProcessSubscriptionPaymentGateway } from '../gateways';

export type ProcessSubscriptionPaymentWebhookInteractorDependencies = {
  gateway: ProcessSubscriptionPaymentGateway;
  presenter: IPresenter;
};

export type InputProcessSubscriptionPaymentWebhooks = {
  action: unknown,
  data: {
    id: number
  }
}

export type ProcessSubscriptionPaymentWebhookControllerDependencies = {
  interactor: ProcessSubscriptionPaymentWebhookInteractor
}