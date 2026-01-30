import { EmailService, LoggerMixin, TokenService } from '../../../services';

class BaseGateway {
  constructor(...args: unknown[]) {}
}
export const MixPurchaseApproved = TokenService(
  LoggerMixin(EmailService(BaseGateway))
);
