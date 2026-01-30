/* eslint-disable @typescript-eslint/no-unused-vars */
import { LoggerMixin } from '../../../services';

class BaseGateway {
  constructor(...args: unknown[]) {}
}
export const MixGetTopContribuitorsGateway = LoggerMixin(BaseGateway);
