import { LoggerMixin, EmailService, TokenService } from '../../services';

class BaseGateway {
  constructor(...args: any[]) {}
}
export const MixProcessSubscriptionPayment = TokenService(
  EmailService(LoggerMixin(BaseGateway))
);
