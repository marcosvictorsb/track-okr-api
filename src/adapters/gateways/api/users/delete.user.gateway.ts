import { LoggerMixin } from '../../../services';

class BaseGateway {
  constructor(..._args: unknown[]) {}
}
export const MixDeleteUser = LoggerMixin(BaseGateway);
