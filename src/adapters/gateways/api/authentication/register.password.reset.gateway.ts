/* eslint-disable @typescript-eslint/no-unused-vars */
import { EmailService, LoggerMixin } from '../../../services';

class BaseGateway {
  constructor(...args: unknown[]) {}
}
export const MixRegisterPasswordResetGateway = LoggerMixin(
  EmailService(BaseGateway)
);
