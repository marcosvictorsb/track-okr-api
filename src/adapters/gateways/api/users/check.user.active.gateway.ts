import { LoggerMixin } from '../../../services';

class BaseGateway {
  constructor(..._args: unknown[]) {}
}
export const MixCheckUserActive = LoggerMixin(BaseGateway);
