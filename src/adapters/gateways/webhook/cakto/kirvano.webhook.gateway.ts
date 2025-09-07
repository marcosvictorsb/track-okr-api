import { EmailService, LoggerMixin, TokenService } from '../../../services';

class BaseGateway {
  constructor(...args: any[]) {}
}
export const MixKirvanoWebhookGateway = TokenService(
  LoggerMixin(EmailService(BaseGateway))
);
