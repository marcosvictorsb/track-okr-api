import { EmailService, LoggerMixin, TokenService } from '../../../services';

class BaseGateway {
  constructor(...args: any[]) {}
}
export const MixPurchaseApproved = TokenService(
  LoggerMixin(EmailService(BaseGateway))
);
