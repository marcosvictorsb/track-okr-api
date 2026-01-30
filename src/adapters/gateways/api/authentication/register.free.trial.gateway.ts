import { EmailService, LoggerMixin, TokenService } from '../../../services';

class BaseGateway {
  constructor(...args: unknown[]) {}
}
export const MixRegisterGateway = TokenService(
  LoggerMixin(EmailService(BaseGateway))
);
