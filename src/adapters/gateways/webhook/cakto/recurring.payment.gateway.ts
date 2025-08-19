import { EmailService, LoggerMixin, TokenService } from '../../../services';

class BaseGateway {
  constructor(...args: any[]) {}
}
export const MixRecurringPayment = TokenService(
  LoggerMixin(EmailService(BaseGateway))
);
