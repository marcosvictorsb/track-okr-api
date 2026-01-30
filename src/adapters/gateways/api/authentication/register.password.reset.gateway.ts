/* eslint-disable @typescript-eslint/no-unused-vars */
import { EmailService, LoggerMixin } from '../../../services';

class BaseGateway {
  constructor(...args: never[]) {}
}
export const MixRegisterPasswordResetGateway = LoggerMixin(
  EmailService(BaseGateway)
);
