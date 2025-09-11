import { TokenService, LoggerMixin, EmailService } from '../../../services';

class BaseGateway {
  constructor(...args: any[]) {}
}
export const MixRegisterPasswordResetGateway = LoggerMixin(
  EmailService(BaseGateway)
);
