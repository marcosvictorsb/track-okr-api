import { LoggerMixin, EmailService, TokenService } from '../../../services';

class BaseGateway {
  constructor(..._args: unknown[]) {}
}
export const MixInviteUser = TokenService(
  EmailService(LoggerMixin(BaseGateway))
);
