import { TokenService, LoggerMixin, EmailService } from '../../../services';

class BaseGateway {
  constructor(...args: any[]) {}
}
export const MixRegisterGateway = TokenService(
  LoggerMixin(EmailService(BaseGateway))
);
