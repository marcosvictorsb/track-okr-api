import { EmailService, LoggerMixin, TokenService } from '../../../services';

class BaseGateway {
  constructor(...args: unknown[]) {}
}
export const MixProcessSubscriptionPayment = TokenService(
  EmailService(LoggerMixin(BaseGateway))
);
