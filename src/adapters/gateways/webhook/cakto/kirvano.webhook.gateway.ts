/* eslint-disable @typescript-eslint/no-unused-vars */
import { EmailService, LoggerMixin, TokenService } from '../../../services';

class BaseGateway {
  constructor(...args: unknown[]) {}
}
export const MixKirvanoWebhookGateway = TokenService(
  LoggerMixin(EmailService(BaseGateway))
);
