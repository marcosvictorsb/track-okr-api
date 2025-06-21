import { LoggerMixin, EmailService } from '../../services';

class BaseGateway {
  constructor(...args: any[]) {}
}
export const MixProcessSubscriptionPayment = EmailService(
  LoggerMixin(BaseGateway)
);
